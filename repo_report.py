#!/usr/bin/env python

from bs4 import BeautifulSoup
from datetime import datetime
import requests
import urllib2
import json
import sys
import re

def getRepoMetaData(url, headers):	
	return requests.get(url, headers=headers)

def getRepoLinks(url):
	reusult = []
	# add link which is not a repo
	excluded_links = ["https://github.com/sindresorhus/awesome", "https://github.com/site/terms", "https://github.com/site/privacy"]
	html_page = urllib2.urlopen(url)
	soup = BeautifulSoup(html_page, 'html.parser')
	# repo link regex
	# https://github.com/..../.... or https://github.com/..../..../
	project_links = soup.findAll('a', attrs={'href': re.compile("^https://github.com/[^\/]+/[^\/]+/*$")})
	for link in project_links:
		href = link['href']
		if href not in excluded_links:
			reusult.append(href.replace("https://github.com/", "https://api.github.com/repos/").rstrip('//'))
	return reusult

def createFile(data):
	data_file = open("repo_report("+datetime.today().strftime('%Y-%m-%d, %H:%M:%S')+").txt","w")
	data_file.write(data)
	data_file.close()

def main():
	try:
		# replace with your access_token
		access_token = '****************************************'
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
				print "%s, %i of %i" % (link, i, len(link_list))
			elif response.status_code == 404:
				print('Not Found: ') + link
			i += 1
		createFile(line)
	except Exception, err:
		print 'Something BAD happend: ', err

if  __name__ == '__main__':
	main()