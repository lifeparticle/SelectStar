#!/usr/bin/env python

import requests
import os
import csv
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
        self.input_file = input_file
        self.output_file = output_file

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

    def create_csv_file(self, data):
        try:
            with open(self.output_file, mode="w", newline='') as file:
                writer = csv.writer(file)
                writer.writerow(["name", "description", "owner_avatar_url", "html_url", "stargazers_count", "created_at", "updated_at", "pushed_at"])
                writer.writerows(data)
            print(f"CSV report successfully created: {self.output_file}")
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
                data.append([
                    repo_data.get("name", ""),
                    repo_data.get("description", ""),
                    repo_data["owner"].get("avatar_url", ""),
                    repo_data.get("html_url", ""),
                    repo_data.get("stargazers_count", 0),
                    repo_data.get("created_at", ""),
                    repo_data.get("updated_at", ""),
                    repo_data.get("pushed_at", "")
                ])
                print(f"Processed {i} of {len(repo_links)}: {link}")
            else:
                print(f"Skipping {link} due to previous errors.")

        if data:
            self.create_csv_file(data)

def main():
    access_token =  os.environ['ACCESS_TOKEN']
    if not access_token:
        print("ACCESS_TOKEN environment variable not found.")
        return

    input_file = "chart_urls.txt"
    output_file = "repo_report.csv"

    analyzer = GitHubRepoAnalyzer(access_token, input_file, output_file)
    analyzer.process_repos()

if __name__ == '__main__':
    main()
