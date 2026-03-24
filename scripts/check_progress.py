#!/usr/bin/env python3
"""查看数据清理进度"""

import json
from pathlib import Path
from datetime import datetime

STATE_FILE = Path('/home/ubuntu/.openclaw/workspace/ossinsight/scripts/cleanup_state.json')
LOG_FILE = Path('/home/ubuntu/.openclaw/workspace/ossinsight/scripts/cleanup.log')

def show_progress():
    if not STATE_FILE.exists():
        print("⚠️  状态文件不存在，尚未开始清理任务")
        return
    
    state = json.load(open(STATE_FILE))
    
    print("=" * 60)
    print("📊 GitHub Users Affiliation Cleanup - 进度报告")
    print("=" * 60)
    print(f"总组织数：    {state['total_orgs']:,}")
    print(f"已处理：      {state['last_offset']:,}")
    print(f"剩余：        {state['total_orgs'] - state['last_offset']:,}")
    
    if state['total_orgs'] > 0:
        progress = state['last_offset'] / state['total_orgs'] * 100
        print(f"进度：        {progress:.2f}%")
        
        # 估算完成时间
        remaining = state['total_orgs'] - state['last_offset']
        batches_left = remaining / 500
        hours_left = batches_left * 10 / 60
        print(f"预计剩余：    {hours_left:.1f} 小时 ({batches_left:.0f} 批次)")
    
    print(f"\n状态：        {'✅ 完成' if state['completed'] else '🔄 进行中'}")
    print(f"最后运行：    {state['last_run'] or '从未'}")
    print("=" * 60)
    
    # 显示最近日志
    if LOG_FILE.exists():
        print("\n📝 最近日志:")
        with open(LOG_FILE) as f:
            lines = f.readlines()[-5:]
            for line in lines:
                print(f"   {line.strip()}")

if __name__ == '__main__':
    show_progress()
