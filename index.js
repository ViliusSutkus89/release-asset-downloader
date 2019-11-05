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

const fs = require('fs')
const https = require('https')
const path = require('path')
const core = require('@actions/core');
const github = require('@actions/github');

const outputDirectory = core.getInput('outputDirectory')
fs.mkdirSync(outputDirectory, { recursive: true})
github.context.payload.release.assets.forEach(asset => {
  console.log('downloading ' + asset.name)

  const outputFilePath = path.join(outputDirectory, asset.name)
  const outputFile = fs.createWriteStream(outputFilePath)
  https.get(asset.browser_download_url, (response) => {
    response.pipe(outputFile)
  }).on('error', (err) => {
    if (err) {
      core.setFailed(err.toString())
    }
  })
})

