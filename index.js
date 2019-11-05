const core = require('@actions/core');
const github = require('@actions/github');

const ok = require('@octokit/rest')()
const fs = require('fs')
const path = require('path')

function errorOut(err) {
  if (err) {
    core.setFailed(err.toString())
  }
}

const owner = process.env.GITHUB_REPOSITORY.split('/')[0]
const repo = process.env.GITHUB_REPOSITORY.split('/')[1]
const tag = process.env.GITHUB_REF.split('/').pop()

ok.repos.getReleaseByTag({
  'owner': owner,
  'repo': repo,
  'tag': tag
}).then(({ data }) => {
  data.assets.forEach(asset => {
    ok.repos.getReleaseAsset({
      'owner': owner,
      'repo': repo,
      'asset_id': asset.id,
      'headers': {
        'Accept': 'application/octet-stream'
      }
    }).then(({ data }) => {
      console.log('downloading ' + asset.name)
      const assetFilePath = path.join(core.getInput('outputDirectory'), asset.name)
      fs.writeFile(assetFilePath, Buffer.from(data), errorOut)
    }, errorOut)
  })
}, errorOut)

