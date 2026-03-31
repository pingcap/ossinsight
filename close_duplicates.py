#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import subprocess
import sys

def close_duplicate_issues():
    """
    Close duplicate issues and reference the main issue in the comment
    """
    
    # Define groups of related issues with a designated master issue for each group
    issue_groups = [
        {
            "category": "AI Agent Tracker Issues",
            "master_issue": 2661,  # "Growth: AI Agent Debugging & Observability Tools Tracker"
            "duplicate_issues": [2675, 2656, 2652, 2648, 2636, 2635, 2632, 2630, 2629, 2613, 2601, 2600, 2597, 2595],
            "description": "Various AI Agent tracker features that are similar in nature to issue #{master}"
        },
        {
            "category": "AI Agent Framework Issues",
            "master_issue": 2684,  # "Growth: AI Agent Framework Migration Cost Calculator"
            "duplicate_issues": [2689, 2662, 2653, 2640, 2621, 2612, 2610],
            "description": "Various AI Agent Framework features that are similar in nature to issue #{master}"
        },
        {
            "category": "SEO Issues",
            "master_issue": 2681,  # "Technical SEO: Allow AhrefsBot and SemrushBot in robots.txt"
            "duplicate_issues": [2679, 2677, 2676, 2673, 2669, 2666, 2665, 2663, 2657, 2654, 2650, 2644, 2642, 2627, 2602, 2591],
            "description": "SEO-related issues that are similar in nature to issue #{master}"
        },
        {
            "category": "Accessibility Issues",
            "master_issue": 2686,  # "Accessibility: Compare repo input field missing aria-label in analyze page"
            "duplicate_issues": [2685, 2634, 2628, 2625, 2623, 2608],
            "description": "Accessibility-related issues that are similar in nature to issue #{master}"
        }
    ]
    
    # Process each group
    for group in issue_groups:
        master_issue = group["master_issue"]
        duplicates = group["duplicate_issues"]
        description_template = group["description"]
        
        print(f"\nProcessing {group['category']}:")
        print(f"Master issue: #{master_issue}")
        print(f"Closing {len(duplicates)} duplicate issues...")
        
        for dup_issue in duplicates:
            print(f"  Closing issue #{dup_issue} as duplicate of #{master_issue}")
            
            # Create a comment explaining why it's being closed as duplicate
            comment_body = f"This issue is being closed as a duplicate of #{master_issue}. Please continue the discussion there."
            
            try:
                # Add comment to the duplicate issue
                comment_result = subprocess.run([
                    'gh', 'issue', 'comment', str(dup_issue), 
                    '--body', comment_body
                ], cwd='/Users/huohao/Repositories/ossinsight', 
                   capture_output=True, text=True)
                
                if comment_result.returncode != 0:
                    print(f"    Failed to add comment to #{dup_issue}: {comment_result.stderr}")
                    continue
                
                # Close the duplicate issue
                close_result = subprocess.run([
                    'gh', 'issue', 'close', str(dup_issue),
                    '--comment', f"Closed as duplicate of #{master_issue}"
                ], cwd='/Users/huohao/Repositories/ossinsight', 
                   capture_output=True, text=True)
                
                if close_result.returncode == 0:
                    print(f"    Successfully closed #{dup_issue}")
                else:
                    print(f"    Failed to close #{dup_issue}: {close_result.stderr}")
                    
            except Exception as e:
                print(f"    Error processing #{dup_issue}: {str(e)}")

def main():
    print("Starting duplicate issue cleanup process...")
    close_duplicate_issues()
    print("\nDuplicate issue cleanup process completed.")

if __name__ == "__main__":
    main()