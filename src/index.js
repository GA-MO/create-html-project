#!/usr/bin/env node

const chalk = require('chalk')
const path = require('path')
const fs = require('fs-extra')
const execSync = require('child_process').execSync
const spawn = require('cross-spawn')
const commandGit = require('simple-git/promise')
const args = process.argv
const commandName = 'new-html-web'
const projectName = args[2]
const useYarn = shouldUseYarn()

if (projectName) {
  const root = path.resolve(projectName)
	createProject(projectName, root)
	.then(() => {
    cloneTemplate(root)
    .then(() => {
      process.chdir(root)
      console.log(chalk.yellow('Installing packages. This might take a couple minutes.'))
      console.log()
      console.log()

      installProject(useYarn).then(() => {
        printSuccessLog(projectName, root, useYarn)
      })
    })
    .catch((err) => {
      console.log()
      console.log()
      console.log(chalk.red(err.command))
      console.log()
      console.log()
    })
	})
} else {
	console.log()
  console.log()
  console.log(
    `Please enter a name of your project directory:  ${chalk.green(commandName)} ${chalk.red('<project-directory>')}`
  )
  console.log()
  console.log()
  process.exit(0)
}

function createProject(name, root) {
	return new Promise((resolve, reject) => {
		console.log()
	  console.log(`Creating a new project in ${chalk.cyan(root)}`)

	  fs.mkdir(name, (fsError) => {
		  if (fsError && fsError.code === 'EEXIST') {
		    console.log()
			  console.log(
		      `The directory ${chalk.red(name)} contains files that could conflict.`
		    )
		    console.log('Try using a new directory name.')
		    console.log()
		    console.log()
		    process.exit(1)
		  } else {
		  	resolve()
		  }
		})
	})
}

function cloneTemplate(root) {
  return new Promise((resolve, reject) => {
    console.log()
    console.log(`${chalk.cyan('Cloning template...')}`)
    console.log()
    const repoPath = 'https://github.com/GA-MO/html-boilerplate.git'
    const rootPart = `${root}/../`
    commandGit(rootPart).clone(repoPath, projectName)
    .then((err, result) => {
      resolve()
    })
    .catch((err) => {
      process.chdir(rootPart)
      spawn('rm', ['-r', templateName]).on('close', code => {
        if (code !== 0) {
          reject({
            command: 'Cannot remove folder template',
          })
          return
        }
        reject({
          command: 'Cannot clone template, Check your internet connection.',
        })
      })
    })
	})
}

function shouldUseYarn() {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

function installProject() {
	return new Promise((resolve, reject) => {
		let command
    let args

		if (useYarn) {
			command = 'yarnpkg'
		} else {
			command = 'npm'
			args = ['install']
		}

		const child = spawn(command, args, { stdio: 'inherit' })
		child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        })
        return
      }
      resolve()
    })
	})
}

function printSuccessLog(appName, useYarn) {

	const displayedCommand = useYarn ? 'yarn' : 'npm run'

	console.log()
	console.log()
  console.log(chalk.green(`Success! Created project ${chalk.cyan(appName)}`))
  console.log()
  console.log()
  console.log('You can run these commands in the project:')
  console.log('-------------------------------------------')
  console.log(`| ${chalk.cyan(`cd ${appName}`)} : Go to project directory.`)
  console.log(`| ${chalk.cyan(`${displayedCommand} dev`)} : Starts the development server.`)
  console.log(`| ${chalk.cyan(`${displayedCommand} build`)} : Bundles files for production.`)
  console.log('-------------------------------------------')
  console.log()
  console.log()
}
