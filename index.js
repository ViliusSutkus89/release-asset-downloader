const core = require('@actions/core');
const github = require('@actions/github');
/*
 * index.js
 *
 * Release asset downloader
 *
 * Copyright (C) 2019 Vilius Sutkus'89
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const ok = require('@octokit/rest')()
const fs = require('fs')
const path = require('path')

function errorOut(err) {
  if (err) {
    core.setFailed(err.toString())
  }
}
const payload = JSON.stringify(github.context.payload, undefined, 2)
console.log(`The event payload: ${payload}`);

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

