#!/usr/bin/env python3
"""
GitHub Users Affiliation Data Cleanup - 定时任务版本
每 10 分钟运行一次，逐步清理所有用户的从属关系

数据流：github_users -> affiliation_names -> affiliations -> github_user_affiliations
"""

import pymysql
import re
import json
import sys
from datetime import datetime
from pathlib import Path

# 配置
DB_CONFIG = {
    'host': 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    'port': 4000,
    'user': '3EDFHZJX5iSzvfr.qwen',
    'password': 'StrongPassword123!',
    'database': 'gharchive_dev',
    'ssl': {'ca': '/etc/ssl/certs/ca-certificates.crt'},
    'autocommit': False
}

STATE_FILE = Path('/home/ubuntu/.openclaw/workspace/ossinsight/scripts/cleanup_state.json')
LOG_FILE = Path('/home/ubuntu/.openclaw/workspace/ossinsight/scripts/cleanup.log')

# 公司别名映射（高频公司）
COMPANY_ALIASES = {
    'Microsoft': ['Microsoft Corporation', 'Microsoft Corp', 'MSFT', 'microsoft', 'Microsoft Ltd'],
    'Google': ['Google LLC', 'Google Inc', 'Alphabet', 'google', 'Google Cloud'],
    'Meta': ['Facebook', 'Facebook Inc', 'Meta Platforms', 'facebook', 'meta'],
    'Amazon': ['Amazon.com', 'amazon', 'AMZN'],
    'Apple': ['Apple Inc', 'apple', 'Apple Computer'],
    'AWS': ['Amazon Web Services', 'aws'],
    'IBM': ['ibm', 'IBM Corporation', 'IBM Ltd'],
    'Intel': ['intel', 'Intel Corporation'],
    'NVIDIA': ['Nvidia', 'nvidia'],
    'Oracle': ['oracle', 'Oracle Corporation'],
    'SAP': ['sap', 'SAP SE'],
    'Salesforce': ['salesforce', 'Salesforce.com'],
    'Adobe': ['adobe', 'Adobe Inc'],
    'VMware': ['vmware'],
    'Cisco': ['CISCO', 'cisco', 'Cisco Systems'],
    'Tencent': ['tencent', '腾讯'],
    'Alibaba': ['alibaba', 'Alibaba Group', 'alibaba.com'],
    'ByteDance': ['bytedance', '字节跳动'],
    'Baidu': ['baidu', '百度'],
    'Huawei': ['HUAWEI', 'huawei', '华为'],
    'GitHub': ['github', 'GitHub Inc'],
    'Red Hat': ['Red Hat Inc', 'red hat'],
    'Shopify': ['shopify'],
    'TCS': ['Tata Consultancy Services', 'tcs'],
    'Accenture': ['accenture'],
    'Capgemini': ['capgemini'],
    'Deloitte': ['deloitte'],
    'Infosys': ['infosys'],
    'EPAM': ['EPAM Systems', 'epam'],
    'ThoughtWorks': ['thoughtworks'],
    'Cognizant': ['cognizant'],
    'Netflix': ['Netflix Inc', 'netflix'],
    'LinkedIn': ['linkedin'],
    'Twitter': ['twitter', 'X Corp'],
    'Uber': ['uber'],
    'Airbnb': ['airbnb'],
    'Spotify': ['spotify'],
    'Stripe': ['stripe'],
}

UNIVERSITY_ALIASES = {
    'Tsinghua University': ['Tsinghua', '清华大学'],
    'Peking University': ['Peking', '北京大学'],
    'Zhejiang University': ['Zhejiang', '浙大'],
    'Carnegie Mellon University': ['CMU', 'Carnegie Mellon'],
    'MIT': ['Massachusetts Institute of Technology'],
    'Stanford University': ['Stanford'],
    'UC Berkeley': ['University of California Berkeley', 'Berkeley'],
    'University of Washington': ['UW', 'Washington'],
    'Northeastern University': ['Northeastern'],
    'UNC Chapel Hill': ['UNC', 'North Carolina'],
}

# 忽略模式
IGNORE_PATTERNS = [
    r'^Independent$', r'^selfemployed$', r'^self-employed$',
    r'^freelance', r'^student$', r'^N/A$', r'^NA$', r'^None$',
    r'^$', r'^\d+$', r'^[A-Z]{2,3}$',
    r'^Japan$', r'^China$', r'^USA$', r'^US$', r'^UK$',
    r'^India$', r'^indonesia$', r'^Germany$', r'^France$',
    r'^Brazil$', r'^Russia$', r'^Spain$', r'^Italy$',
    r'^Canada$', r'^Australia$', r'^Singapore$',
    r'^Remote$', r'^Worldwide$', r'^Global$',
]


def log(message):
    """记录日志"""
    timestamp = datetime.now().isoformat()
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    with open(LOG_FILE, 'a') as f:
        f.write(log_line + '\n')


def load_state():
    """加载进度状态"""
    if STATE_FILE.exists():
        with open(STATE_FILE) as f:
            return json.load(f)
    return {
        'last_offset': 0,
        'processed_orgs': 0,
        'total_orgs': 0,
        'last_run': None,
        'completed': False
    }


def save_state(state):
    """保存进度状态"""
    state['last_run'] = datetime.now().isoformat()
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)


def connect_db():
    return pymysql.connect(**DB_CONFIG)


def normalize_name(name):
    """归一化公司名称"""
    if not name:
        return None
    name = name.strip()
    
    # 检查忽略模式
    for pattern in IGNORE_PATTERNS:
        if re.match(pattern, name, re.IGNORECASE):
            return None
    
    # 去除@前缀
    if name.startswith('@'):
        name = name[1:]
    
    # 去除公司后缀
    suffixes = [
        r'\s*Inc\.?$', r'\s*LLC\.?$', r'\s*Ltd\.?$', r'\s*Corporation$',
        r'\s*Corp\.?$', r'\s*Co\.?$', r'\s*GmbH$', r'\s*BV$', r'\s*SE$',
        r'\s*Pte\.?\s*Ltd\.?$', r'\s*Holdings$', r'\s*Group$',
    ]
    for suffix in suffixes:
        name = re.sub(suffix, '', name, flags=re.IGNORECASE)
    
    # 清理逗号和多余空格
    name = re.sub(r'\s*,\s*', ' ', name)
    name = re.sub(r'\s+', ' ', name)
    name = name.title()
    
    return name.strip() if len(name.strip()) > 1 else None


def match_canonical(org_name, canonical_map):
    """匹配到标准名称"""
    if not org_name:
        return None
    
    org_lower = org_name.lower()
    
    # 精确匹配
    for canonical, aliases in canonical_map.items():
        if org_lower == canonical.lower() or org_lower in [a.lower() for a in aliases]:
            return canonical
    
    # 归一化后匹配
    normalized = normalize_name(org_name)
    if normalized:
        norm_lower = normalized.lower()
        for canonical, aliases in canonical_map.items():
            if norm_lower == canonical.lower() or norm_lower in [a.lower() for a in aliases]:
                return canonical
    
    return None


def get_unprocessed_orgs(cursor, offset=0, limit=500):
    """获取未处理的组织（批量处理）"""
    cursor.execute("""
        SELECT organization_formatted, COUNT(*) as cnt 
        FROM github_users 
        WHERE organization_formatted IS NOT NULL 
          AND organization_formatted != ''
        GROUP BY organization_formatted 
        ORDER BY cnt DESC 
        LIMIT %s OFFSET %s
    """, (limit, offset))
    return cursor.fetchall()


def get_total_org_count(cursor):
    """获取总组织数"""
    cursor.execute("""
        SELECT COUNT(DISTINCT organization_formatted) 
        FROM github_users 
        WHERE organization_formatted IS NOT NULL AND organization_formatted != ''
    """)
    return cursor.fetchone()[0]


def process_batch():
    """处理一批数据"""
    log("🔄 开始数据清理任务...")
    
    conn = connect_db()
    cursor = conn.cursor()
    state = load_state()
    
    # 构建映射表
    canonical_map = {}
    canonical_map.update(COMPANY_ALIASES)
    canonical_map.update(UNIVERSITY_ALIASES)
    
    # 获取总数（如果是第一次运行）
    if state['total_orgs'] == 0:
        state['total_orgs'] = get_total_org_count(cursor)
        log(f"📊 总组织数：{state['total_orgs']:,}")
    
    # 获取一批组织
    orgs = get_unprocessed_orgs(cursor, state['last_offset'], limit=500)
    
    if not orgs:
        log("✅ 所有组织已处理完成!")
        state['completed'] = True
        save_state(state)
        
        # 生成最终报告
        generate_report(cursor)
        return
    
    log(f"📦 处理批次：{len(orgs)} 个组织 (offset: {state['last_offset']})")
    
    # 收集待插入数据
    new_affiliations = []
    new_aliases = []
    stats = {'matched': 0, 'normalized': 0, 'ignored': 0}
    
    # 先加载现有 affiliations
    cursor.execute("SELECT id, name FROM affiliations")
    existing_affs = {name: id for id, name in cursor.fetchall()}
    
    for org_name, count in orgs:
        # 检查是否忽略
        should_ignore = any(re.match(p, org_name, re.IGNORECASE) for p in IGNORE_PATTERNS)
        if should_ignore:
            stats['ignored'] += count
            continue
        
        # 尝试匹配
        canonical = match_canonical(org_name, canonical_map)
        
        if canonical:
            stats['matched'] += count
            aff_name = canonical
        else:
            # 归一化处理
            normalized = normalize_name(org_name)
            if normalized and len(normalized) > 2:
                stats['normalized'] += count
                aff_name = normalized
            else:
                stats['ignored'] += count
                continue
        
        # 获取或创建 affiliation
        aff_id = existing_affs.get(aff_name)
        if not aff_id:
            aff_type = 'EDU' if any(u in aff_name for u in ['University', 'College', 'School', 'Institute']) else 'COM'
            new_affiliations.append((aff_name, aff_type))
            existing_affs[aff_name] = None  # 标记
        
        # 添加别名
        if org_name.lower() != aff_name.lower():
            new_aliases.append((org_name, aff_name))
    
    # 批量插入 affiliations
    if new_affiliations:
        to_insert = [(t, n) for n, t in new_affiliations if existing_affs.get(n) is None]
        if to_insert:
            cursor.executemany("INSERT IGNORE INTO affiliations (type, name) VALUES (%s, %s)", to_insert)
            conn.commit()
            
            # 重新获取 ID - 使用更可靠的方式
            new_names = tuple([n for n, _ in new_affiliations if existing_affs.get(n) is None])
            if new_names:
                placeholders = ','.join(['%s'] * len(new_names))
                cursor.execute(f"SELECT id, name FROM affiliations WHERE name IN ({placeholders})", new_names)
                for aff_id, name in cursor.fetchall():
                    existing_affs[name] = aff_id
    
    # 批量插入 aliases
    if new_aliases:
        alias_data = []
        for alias_name, aff_name in new_aliases:
            aff_id = existing_affs.get(aff_name)
            if aff_id:
                alias_data.append((alias_name, aff_id))
            else:
                # 尝试直接查找
                cursor.execute("SELECT id FROM affiliations WHERE name = %s", (aff_name,))
                result = cursor.fetchone()
                if result:
                    existing_affs[aff_name] = result[0]
                    alias_data.append((alias_name, result[0]))
        
        if alias_data:
            # 使用 ON DUPLICATE KEY UPDATE 来更新现有记录
            cursor.executemany(
                "INSERT INTO affiliation_names (name, affiliation_id) VALUES (%s, %s) "
                "ON DUPLICATE KEY UPDATE affiliation_id = VALUES(affiliation_id)",
                alias_data
            )
            conn.commit()
            log(f"   插入/更新 {len(alias_data)} 个别名映射")
    
    # 更新状态
    state['last_offset'] += len(orgs)
    state['processed_orgs'] += len(orgs)
    save_state(state)
    
    # 输出统计
    progress = (state['last_offset'] / state['total_orgs'] * 100) if state['total_orgs'] > 0 else 0
    log(f"📈 进度：{state['last_offset']:,}/{state['total_orgs']:,} ({progress:.1f}%)")
    log(f"   匹配标准名：{stats['matched']:,} 用户")
    log(f"   归一化处理：{stats['normalized']:,} 用户")
    log(f"   已忽略：{stats['ignored']:,} 用户")
    
    cursor.close()
    conn.close()
    
    log("✅ 批次处理完成")


def generate_report(cursor):
    """生成最终报告"""
    cursor.execute("SELECT COUNT(*) FROM affiliations")
    total_affs = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM affiliation_names WHERE affiliation_id IS NOT NULL")
    total_aliases = cursor.fetchone()[0]
    
    cursor.execute("""
        SELECT COUNT(DISTINCT gu.id) 
        FROM github_users gu
        JOIN affiliation_names an ON gu.organization_formatted = an.name
        WHERE an.affiliation_id IS NOT NULL
    """)
    users_with_aff = cursor.fetchone()[0]
    
    log("\n" + "=" * 50)
    log("📊 数据清理完成报告")
    log("=" * 50)
    log(f"总 affiliations: {total_affs:,}")
    log(f"总别名映射：{total_aliases:,}")
    log(f"已关联用户：{users_with_aff:,}")
    log("=" * 50)


if __name__ == '__main__':
    try:
        process_batch()
    except Exception as e:
        log(f"❌ 错误：{e}")
        sys.exit(1)
