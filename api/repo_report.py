#!/usr/bin/env python
import requests
import os
import json
import sys
from datetime import datetime
from dotenv import load_dotenv
import time
# Load environment variables from .env only in development
if os.getenv('ENV') != 'production':
    load_dotenv()


class GitHubRepoAnalyzer:
    def __init__(self, access_token, input_file, output_file):
        self.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': f'token {access_token}'
        }
        self.input_file = os.path.join("../data", input_file)
        self.output_file = os.path.join("../data", output_file)

    def get_repo_meta_data(self, url):
        try:
            response = requests.get(url, headers=self.headers)
            # Will raise an HTTPError for bad responses
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 401:
                print(f"Unauthorized access - 401 Client Error for URL: {url}. Exiting the program.")
                sys.exit(1)  # Exit the program with a non-zero exit code to indicate an error
            else:
                print(f"Error fetching data from {url}: {e}")
                return None
        except requests.RequestException as e:
            print(f"Error fetching data from {url}: {e}")
            return None

    def get_repo_links_from_file(self):
        try:
            with open(self.input_file, 'r') as file:
                unique_urls = set(
                    line.strip().replace("https://github.com/", "https://api.github.com/repos/").rstrip('/')
                    for line in file if line.strip()
                )
                return list(unique_urls)
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

            # Add delay between requests
            time.sleep(2)

        if data:
            self.create_json_file(data)


def main():
    if len(sys.argv) != 3:
        print("Usage: repo_report.py <input_file> <output_file>")
        return

    access_token = os.environ.get('ACCESS_TOKEN')
    if not access_token:
        print("ACCESS_TOKEN environment variable not found.")
        return

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    analyzer = GitHubRepoAnalyzer(access_token, input_file, output_file)
    analyzer.process_repos()


if __name__ == '__main__':
    main()
