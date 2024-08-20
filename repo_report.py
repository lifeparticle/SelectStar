#!/usr/bin/env python

import requests
import os
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env only in development
if os.getenv('ENV') != 'production':
    load_dotenv()

class GitHubRepoAnalyzer:
    def __init__(self, access_token, input_file, output_file):
        self.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': f'token {access_token}'
        }
        self.input_file = os.path.join("data", input_file)
        self.output_file = os.path.join("data", output_file)

    def get_repo_meta_data(self, url):
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()  # Will raise an HTTPError for bad responses
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching data from {url}: {e}")
            return None

    def get_repo_links_from_file(self):
        try:
            with open(self.input_file, 'r') as file:
                return [
                    line.strip().replace("https://github.com/", "https://api.github.com/repos/").rstrip('/')
                    for line in file if line.strip()
                ]
        except FileNotFoundError:
            print(f'File not found: {self.input_file}')
            return []

    def create_json_file(self, data):
        try:
            output_data = {
                "data": data,
                "meta": {
                    "last_updated": datetime.utcnow().isoformat() + "Z"
                }
            }
            with open(self.output_file, mode="w") as file:
                json.dump(output_data, file, indent=4)
            print(f"JSON report successfully created: {self.output_file}")
        except IOError as e:
            print(f"Error writing to file {self.output_file}: {e}")

    def process_repos(self):
        repo_links = self.get_repo_links_from_file()
        if not repo_links:
            print("No repository links found or file could not be read.")
            return

        data = []
        for i, link in enumerate(repo_links, 1):
            repo_data = self.get_repo_meta_data(link)
            if repo_data:
                data.append({
                    "name": repo_data.get("name", ""),
                    "description": repo_data.get("description", ""),
                    "owner_avatar_url": repo_data["owner"].get("avatar_url", ""),
                    "html_url": repo_data.get("html_url", ""),
                    "stargazers_count": repo_data.get("stargazers_count", 0),
                    "created_at": repo_data.get("created_at", ""),
                    "updated_at": repo_data.get("updated_at", ""),
                    "pushed_at": repo_data.get("pushed_at", "")
                })
                print(f"Processed {i} of {len(repo_links)}: {link}")
            else:
                print(f"Skipping {link} due to previous errors.")

        if data:
            self.create_json_file(data)

def main():
    access_token =  os.environ['ACCESS_TOKEN']
    if not access_token:
        print("ACCESS_TOKEN environment variable not found.")
        return

    input_file = "test_urls.txt"
    output_file = "test_report.json"

    analyzer = GitHubRepoAnalyzer(access_token, input_file, output_file)
    analyzer.process_repos()

if __name__ == '__main__':
    main()
