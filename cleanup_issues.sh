#!/bin/bash

# Script to help identify and tag potential duplicate issues in pingcap/ossinsight

echo "Starting issue cleanup process..."

# Get all open issues and process them
echo "Fetching all open issues..."

# Process AI Agent Framework Intelligence issues
echo "Processing AI Agent Framework Intelligence issues..."
for issue in $(gh issue list --state open --limit 100 --json number,title --jq '.[] | select(.title | contains("AI Agent Framework")) | .number'); do
  echo "Tagging issue #$issue as potentially related to AI Agent Framework Intelligence"
  gh issue edit "$issue" --add-label "type/duplicate-potential" --repo pingcap/ossinsight
done

# Process AI Agent Tracker issues
echo "Processing AI Agent Tracker issues..."
for issue in $(gh issue list --state open --limit 100 --json number,title --jq '.[] | select(.title | contains("AI Agent") and (.title | contains("Tracker"))) | .number'); do
  echo "Tagging issue #$issue as potentially related to AI Agent Tracker suite"
  gh issue edit "$issue" --add-label "type/duplicate-potential" --repo pingcap/ossinsight
done

# Process SEO-related issues
echo "Processing SEO-related issues..."
for issue in $(gh issue list --state open --limit 100 --json number,title --jq '.[] | select(.title | test("(?i)(seo|meta.*description|structured.*data)")) | .number'); do
  echo "Tagging issue #$issue as potentially related to SEO improvements"
  gh issue edit "$issue" --add-label "type/duplicate-potential" --repo pingcap/ossinsight
done

# Process Accessibility-related issues
echo "Processing Accessibility-related issues..."
for issue in $(gh issue list --state open --limit 100 --json number,title --jq '.[] | select(.title | test("(?i)(accessibility|aria.*label|aria.*hidden)")) | .number'); do
  echo "Tagging issue #$issue as potentially related to Accessibility improvements"
  gh issue edit "$issue" --add-label "type/duplicate-potential" --repo pingcap/ossinsight
done

echo "Issue tagging completed. Review issues with 'type/duplicate-potential' label and consolidate as appropriate."