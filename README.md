# SelectStar

This script will help you to create an html repo report based on stars and other parameters.
You'll need to give the python script a link that has the list of repo links.
I'm using the following link to get all the repo links.

https://github.com/wbkd/awesome-d3

After you've successfully run the python script, it will create a data file, separated by space.
You can use this data file to generate your repo report by using repo_report.html by selecting the data file.

## Prerequisite

```
easy_install pip
sudo pip install requests
sudo pip install beautifulsoup4
```

## Run

```
python repo_report.py
```

## Further readings
https://api.github.com/rate_limit

https://pythex.org/

https://developer.github.com/v3/auth/#basic-authentication

https://datatables.net/manual/installation


## Bug Reports and Feature Requests
Please create an issue with as much information you can. Thank you.

## Author
Mahbub Zaman (https://mahbub.ninja)

## License
MIT License