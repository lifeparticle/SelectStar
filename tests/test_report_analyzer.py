import os
import json
import requests
import unittest
from datetime import datetime
from unittest.mock import patch, mock_open, MagicMock
from repo_report import GitHubRepoAnalyzer


class TestGitHubRepoAnalyzer(unittest.TestCase):
    def load_mock_response(self):
        with open(os.path.join(os.path.dirname(__file__),
                               'mock_github_repo_response.json'), 'r') as file:
            return json.load(file)

    @patch('os.path.join', return_value='data/backend_framework_urls.txt')
    @patch('builtins.open', new_callable=mock_open, read_data='https://github.com/mock\n')
    def test_get_repo_links_from_file(self, mock_open, mock_path_join):
        analyzer = GitHubRepoAnalyzer("token", "input_file.txt", "output_file.txt")
        links = analyzer.get_repo_links_from_file()
        print("links: ", links)
        expected_url = ["https://api.github.com/repos/mock"]
        self.assertEqual(links, expected_url)
        mock_open.assert_called_once_with('data/backend_framework_urls.txt', 'r')

    @patch('requests.get')
    def test_get_repo_meta_data_success(self, mock_get):
        analyzer = GitHubRepoAnalyzer("token", "input_file.txt", "output_file.txt")

        # mock response from github api
        mock_response_data = self.load_mock_response()
        # mock response object
        mock_response = MagicMock()
        mock_response.json.return_value = mock_response_data
        mock_response.raise_for_status = MagicMock()
        # mock respose to be returned by requests.get
        mock_get.return_value = mock_response

        url = "https://api.github.com/repos/owner/repo"
        repo_data = analyzer.get_repo_meta_data(url)

        self.assertEqual(repo_data, mock_response_data)

    @patch('requests.get')
    def test_get_repo_meta_data_failure(self, mock_get):
        analyzer = GitHubRepoAnalyzer("token", "input_file.txt", "output_file.txt")

        # mock failure response from github api
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("Error occurred")
        mock_get.return_value = mock_response

        url = "https://api.github.com/repos/owner/repo"
        repo_data = analyzer.get_repo_meta_data(url)

        self.assertIsNone(repo_data)

    @patch('builtins.open', new_callable=mock_open)
    @patch('repo_report.datetime')
    def test_create_json_file(self, mock_datetime, mock_open):
        # Set the mock datetime to return a fixed value
        mock_datetime.utcnow.return_value = datetime(2024, 1, 1, 0, 0, 0)
        analyzer = GitHubRepoAnalyzer("token", "input_file.txt", "output_file.txt")
        data = [{"mock_name": "mock_value"}]
        analyzer.create_json_file(data=data)
        output = json.dumps({
            "data": data,
            "meta": {"last_updated": "2024-01-01T00:00:00Z"}
        }, indent=4)
        # Collect all the write calls
        written_data = ''.join(call.args[0] for call in mock_open().write.call_args_list)
        # Assert that the combined write calls equal the expected output
        self.assertEqual(written_data, output)

    @patch.object(GitHubRepoAnalyzer, 'get_repo_links_from_file',
                  return_value=["https://api.github.com/repos/owner/repo"])
    @patch.object(GitHubRepoAnalyzer, 'create_json_file')
    def test_process_repos(self, mock_create_json_file,
                           mock_get_repo_links_from_file):
        mock_repo_meta_data = self.load_mock_response()

        with patch.object(GitHubRepoAnalyzer, 'get_repo_meta_data',
                          return_value=mock_repo_meta_data) \
                as mock_get_repo_meta_data:
            analyzer = GitHubRepoAnalyzer("token", "input_file.txt", "output_file.txt")
            analyzer.process_repos()

            mock_get_repo_links_from_file.assert_called_once()
            mock_get_repo_meta_data.assert_called_once_with("https://api.github.com/repos/owner/repo")
            mock_create_json_file.assert_called_once()


if __name__ == '__main__':
    unittest.main()
