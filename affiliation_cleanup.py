#!/usr/bin/env python3
"""
GitHub Users Affiliation Data Cleanup Script - 批量优化版
清理 github_users 表中的公司从属关系数据
"""

import pymysql
import re
from difflib import SequenceMatcher
import json
from datetime import datetime

# 数据库配置
DB_CONFIG = {
    'host': 'gateway01.us-west-2.prod.aws.tidbcloud.com',
    'port': 4000,
    'user': '3EDFHZJX5iSzvfr.qwen',
    'password': 'StrongPassword123!',
    'database': 'gharchive_dev',
    'ssl': {'ca': '/etc/ssl/certs/ca-certificates.crt'},
    'autocommit': False
}

# 公司别名映射表（手动 curated 的高价值公司）
COMPANY_ALIASES = {
    'Microsoft': ['Microsoft Corporation', 'Microsoft Corp', 'MSFT', 'microsoft'],
    'Google': ['Google LLC', 'Google Inc', 'Alphabet', 'google'],
    'Meta': ['Facebook', 'Facebook Inc', 'Meta Platforms', 'facebook', 'meta'],
    'Amazon': ['Amazon.com', 'amazon', 'AMZN'],
    'Apple': ['Apple Inc', 'apple', 'Apple Computer'],
    'AWS': ['Amazon Web Services', 'aws', 'Amazon AWS'],
    'IBM': ['ibm', 'IBM Corporation'],
    'Intel': ['intel', 'Intel Corporation'],
    'NVIDIA': ['Nvidia', 'nvidia', 'NVIDIA Corporation'],
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
    'Deloitte': ['deloitte', 'Deloitte Touche Tohmatsu'],
    'Infosys': ['infosys'],
    'EPAM': ['EPAM Systems', 'epam'],
    'ThoughtWorks': ['thoughtworks'],
    'Cognizant': ['cognizant'],
    'Esri': ['esri'],
    'Globant': ['globant'],
    'Sage': ['sage'],
    'Twitter': ['twitter', 'X Corp'],
    'LinkedIn': ['linkedin', 'LinkedIn Corporation'],
    'Netflix': ['Netflix Inc', 'netflix'],
    'Uber': ['uber', 'Uber Technologies'],
    'Airbnb': ['airbnb'],
    'Spotify': ['spotify'],
    'Stripe': ['stripe'],
}

# 教育机构
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

# 需要忽略的值
IGNORE_PATTERNS = [
    r'^Independent$', r'^selfemployed$', r'^self-employed$',
    r'^freelance', r'^student$', r'^N/A$', r'^NA$', r'^None$',
    r'^$', r'^\d+$', r'^[A-Z]{2,3}$',
    r'^Japan$', r'^China$', r'^USA$', r'^US$', r'^UK$',
    r'^India$', r'^indonesia$', r'^Germany$', r'^France$',
]


def connect_db():
    return pymysql.connect(**DB_CONFIG)


def normalize_name(name):
    """归一化名称"""
    if not name:
        return None
    name = name.strip()
    for pattern in IGNORE_PATTERNS:
        if re.match(pattern, name, re.IGNORECASE):
            return None
    if name.startswith('@'):
        name = name[1:]
    suffixes = [r'\s*Inc\.?$', r'\s*LLC\.?$', r'\s*Ltd\.?$', r'\s*Corporation$',
                r'\s*Corp\.?$', r'\s*Co\.?$', r'\s*GmbH$', r'\s*BV$', r'\s*SE$']
    for suffix in suffixes:
        name = re.sub(suffix, '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*,\s*', ' ', name)
    name = re.sub(r'\s+', ' ', name)
    name = name.title()
    return name.strip() if name.strip() else None


def match_to_canonical(org_name, canonical_map):
    """匹配到标准名称"""
    if not org_name:
        return None, 0
    
    org_lower = org_name.lower()
    
    # 精确匹配
    for canonical, aliases in canonical_map.items():
        if org_lower == canonical.lower():
            return canonical, 1.0
        if any(org_lower == alias.lower() for alias in aliases):
            return canonical, 1.0
    
    # 归一化后匹配
    normalized = normalize_name(org_name)
    if normalized:
        for canonical, aliases in canonical_map.items():
            if normalized.lower() == canonical.lower():
                return canonical, 0.95
            if any(normalized.lower() == alias.lower() for alias in aliases):
                return canonical, 0.95
    
    # 模糊匹配
    best_match = None
    best_score = 0.88
    
    for canonical, aliases in canonical_map.items():
        for name in [canonical] + aliases:
            score = SequenceMatcher(None, org_lower, name.lower()).ratio()
            if score > best_score:
                best_score = score
                best_match = canonical
    
    return best_match, best_score if best_match else 0


def process_affiliations():
    """主处理流程 - 批量版本"""
    print("🔗 连接数据库...")
    conn = connect_db()
    cursor = conn.cursor()
    
    print("📊 获取高频组织列表...")
    cursor.execute("""
        SELECT organization_formatted, COUNT(*) as cnt 
        FROM github_users 
        WHERE organization_formatted IS NOT NULL AND organization_formatted != '' 
        GROUP BY organization_formatted 
        ORDER BY cnt DESC 
        LIMIT 5000
    """)
    orgs = cursor.fetchall()
    print(f"   找到 {len(orgs)} 个唯一组织名")
    
    print("🏷️  构建标准名称映射...")
    canonical_map = {}
    for canonical, aliases in COMPANY_ALIASES.items():
        canonical_map[canonical] = aliases
    for canonical, aliases in UNIVERSITY_ALIASES.items():
        canonical_map[canonical] = aliases
    print(f"   加载 {len(canonical_map)} 个标准公司/学校")
    
    # 先获取现有的 affiliations
    print("📋 加载现有 affiliations...")
    cursor.execute("SELECT id, name, type FROM affiliations")
    existing_affs = {row[1]: row[0] for row in cursor.fetchall()}
    print(f"   现有 {len(existing_affs)} 个 affiliations")
    
    # 批量收集待插入数据
    new_affiliations = []
    new_aliases = []
    stats = {'matched': 0, 'unmatched': 0, 'ignored': 0}
    
    print("\n🔄 处理组织映射...")
    for i, (org_name, count) in enumerate(orgs):
        if i % 1000 == 0:
            print(f"   进度：{i}/{len(orgs)}")
        
        # 检查是否忽略
        should_ignore = any(re.match(p, org_name, re.IGNORECASE) for p in IGNORE_PATTERNS)
        if should_ignore:
            stats['ignored'] += count
            continue
        
        # 匹配
        canonical, score = match_to_canonical(org_name, canonical_map)
        
        if canonical:
            stats['matched'] += count
            aff_id = existing_affs.get(canonical)
            
            if not aff_id:
                # 新公司
                aff_type = 'EDU' if any(u in canonical for u in ['University', 'College', 'MIT']) else 'COM'
                new_affiliations.append((canonical, aff_type))
                existing_affs[canonical] = None  # 标记待插入
            else:
                aff_id = existing_affs[canonical]
            
            # 添加别名
            if org_name.lower() != canonical.lower() and aff_id:
                new_aliases.append((org_name, aff_id))
        else:
            stats['unmatched'] += count
            # 高频未匹配项，创建新记录
            if count >= 500:
                normalized = normalize_name(org_name)
                if normalized and normalized.lower() != org_name.lower():
                    aff_type = 'EDU' if any(u in normalized for u in ['University', 'College', 'School']) else 'COM'
                    if normalized not in existing_affs:
                        new_affiliations.append((normalized, aff_type))
                        existing_affs[normalized] = None
                    new_aliases.append((org_name, existing_affs.get(normalized)))
    
    # 批量插入 affiliations
    print(f"\n💾 批量插入 {len(new_affiliations)} 个新 affiliations...")
    if new_affiliations:
        cursor.executemany(
            "INSERT INTO affiliations (type, name) VALUES (%s, %s)",
            [(t, n) for n, t in new_affiliations]
        )
        conn.commit()
        
        # 重新加载获取 ID
        cursor.execute("SELECT id, name FROM affiliations WHERE name IN %s", 
                      (tuple([n for n, _ in new_affiliations]),))
        for aff_id, name in cursor.fetchall():
            existing_affs[name] = aff_id
    
    # 批量插入 aliases
    print(f"💾 批量插入 {len(new_aliases)} 个别名...")
    if new_aliases:
        # 过滤掉没有 affiliation_id 的
        valid_aliases = [(n, existing_affs.get(c)) for n, c in new_aliases if existing_affs.get(c)]
        if valid_aliases:
            cursor.executemany(
                "INSERT IGNORE INTO affiliation_names (name, affiliation_id) VALUES (%s, %s)",
                valid_aliases
            )
            conn.commit()
    
    print("\n✅ 处理完成!")
    print(f"\n📈 统计结果:")
    print(f"   匹配到标准公司：{stats['matched']:,} 用户")
    print(f"   未匹配：{stats['unmatched']:,} 用户")
    print(f"   已忽略：{stats['ignored']:,} 用户")
    
    cursor.close()
    conn.close()
    return stats


if __name__ == '__main__':
    print("=" * 60)
    print(f"GitHub Users Affiliation Cleanup - {datetime.now()}")
    print("=" * 60)
    stats = process_affiliations()
    print("\n" + json.dumps(stats, indent=2))
