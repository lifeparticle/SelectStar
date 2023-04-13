#!/usr/bin/env python

import requests
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
import sys

def getRepoMetaData(url, headers):
	return requests.get(url, headers=headers)

def getRepoLinks(url):
	result = []
	# add links that are not repos
	excluded_links = ["https://github.com/sindresorhus/awesome", "https://github.com/site/terms", "https://github.com/site/privacy"]
	html_page = requests.get(url)
	soup = BeautifulSoup(html_page.content, 'html.parser')
	# repo link regex
	# https://github.com/..../.... or https://github.com/..../..../
	project_links = soup.findAll('a', attrs={'href': re.compile("^https://github.com/[^\/]+/[^\/]+/*$")})
	for link in project_links:
		href = link['href']
		if href not in excluded_links:
			result.append(href.replace("https://github.com/", "https://api.github.com/repos/").rstrip('//'))
	return result

def createFile(data):
	data_file = open("repo_report.txt","w")
	data_file.write(data)
	data_file.close()

def main():
	try:
		# replace with your access_token
		access_token = os.environ['ACCESS_TOKEN']
		headers = {
			'Accept': 'application/vnd.github.v3+json',
			'Authorization': 'token '+access_token
		}
		# replace with your source of github links you want to compare
		link_list = getRepoLinks("https://github.com/wbkd/awesome-d3")

		line = "%s %s %s %s %s" % ("html_url", "stargazers_count", "created_at", "updated_at", "pushed_at")
		i = 1
		for link in link_list:
			response = getRepoMetaData (link, headers)
			if response.status_code == 200:
				json_data = json.loads(response.text)
				line += '\n'
				line += "%s %s %s %s %s" % (json_data["html_url"], json_data["stargazers_count"], json_data["created_at"], json_data["updated_at"], json_data["pushed_at"])
				print("%s, %i of %i" % (link, i, len(link_list)))
			elif response.status_code == 404:
				print('Not Found: ' + link)
			i += 1
		createFile(line)
	except Exception as err:
		print('Something BAD happened: ' + str(err))

if __name__ == '__main__':
	main()
