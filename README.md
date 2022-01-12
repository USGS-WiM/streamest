![WiM](wimlogo.png)

# StreamEst

StreamEst Client Application.

### Prerequisites

##### required software
[node.js](http://nodejs.org)  [Version 7.8.0]
[git](https://git-scm.com/)  
[typescript 1.7] (https://github.com/Microsoft/TypeScript)

This will install the following packages globally

```bash
npm install -g bower
npm install -g gulp
npm install -g typings
```
## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

https://help.github.com/articles/cloning-a-repository/

This will install the required dependencies to the project. Works best when using an administrator command prompt. If given a choice after entering ```bower install```, select 10 (angular#1.x which resolves to 1.3.20 and is required by angular-leaflet-directive#0.10.0).

Inside of your project folder (after git fork and clone):
```bash
npm install
bower install
typings install 
```
[upgrade from tsd to typings] (https://github.com/DefinitelyTyped/tsd/issues/269)


## Building and Testing

### To run the client locally
```
gulp watch
```

### To build a production version of the app:

**Commit, Sync, and Merge Pull Request on any current project changes.  The steps below require a clean git status.**

##### Step 1.
Bump the version.  Run only one of the below commands.  
This creates a local commit with the package.json, bower.json and tsd.json updated to the new version number

```
gulp patch     # makes v0.1.0 → v0.1.1
gulp feature   # makes v0.1.1 → v0.2.0
gulp release   # makes v0.2.1 → v1.0.0
```

##### Step 2.   
 Push the commit that contains the json files with bumped versions to your personal github repo 
 
```
git push origin master
```

##### Step 3.   
 Create and merge pull request with version incremented (github.com)

##### Step 4.  
Get latest version from upstream (all this should be is a commit for the pull request in Step 3.) 

```
git pull USGS-WiM master
```

##### Step 5.   
Run "gulp push" to push the commit with the release tags up to the upstream (WiM) repository.

```
gulp push
```

## Built With

* typscript

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on adhering by the [USGS Code of Scientific Conduct](https://www2.usgs.gov/fsp/fsp_code_of_scientific_conduct.asp).

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](../../tags). 

Advance the version when adding features, fixing bugs or making minor enhancement. Follow semver principles. To add tag in git, type git tag v{major}.{minor}.{patch}. Example: git tag v2.0.5

To push tags to remote origin: `git push origin --tags`

*Note that your alias for the remote origin may differ.

## Authors

* **[Jeremy Newson](https://www.usgs.gov/staff-profiles/jeremy-k-newson)**  - *Lead Developer* - [USGS Web Informatics & Mapping](https://wim.usgs.gov/)

See also the list of [contributors](../../graphs/contributors) who participated in this project.

## License

This project is licensed under the Creative Commons CC0 1.0 Universal License - see the [LICENSE.md](LICENSE.md) file for details

## Suggested Citation

In the spirit of open source, please cite any re-use of the source code stored in this repository. Below is the suggested citation:

`This project contains code produced by the Web Informatics and Mapping (WIM) team at the United States Geological Survey (USGS). As a work of the United States Government, this project is in the public domain within the United States. https://wim.usgs.gov`


## About WIM

* This project authored by the [USGS WIM team](https://wim.usgs.gov)
* WIM is a team of developers and technologists who build and manage tools, software, web services, and databases to support USGS science and other federal government cooperators.
* WiM is a part of the [Upper Midwest Water Science Center](https://www.usgs.gov/centers/wisconsin-water-science-center).
