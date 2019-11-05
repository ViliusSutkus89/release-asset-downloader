const ok = require('@octokit/rest')()
const fs = require('fs')
const path = require('path')

function errorOut(err) {
  if (err) {
    console.error(err.toString())
    process.exit(1)
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
    const assetFilePath = path.join(process.env.INPUT_OUTPUTDIRECTORY, asset.name)
    console.log(assetFilePath)
    ok.repos.getReleaseAsset({
      'owner': owner,
      'repo': repo,
      'asset_id': asset.id,
      'headers': {
        'Accept': 'application/octet-stream'
      }
    }).then(({ data }) => {
      console.log('downloading ' + asset.name)
      fs.writeFile(assetFilePath, Buffer.from(data), errorOut)
    }, errorOut)
  })
}, errorOut)

