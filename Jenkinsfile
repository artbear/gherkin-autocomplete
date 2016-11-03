#!groovy
node("qanode") {
    
  stage('Get source code') {
   
    //git url: 'https://github.com/silverbulleters/gherkin-autocomplete.git'
    
    checkout scm

    def command = "git config --system core.longpaths true"
    if (isUnix()) {
        sh '${command}'
    } else {
        bat "${command}"
    }

    command = "git submodule update --init"
    if (isUnix()) {
        sh '${command}'
    } else {
        bat "${command}"
    }
    
  }
  stage('Env setup') {

    def command = "npm install"
    timestamps {
        if (isUnix()){
            sh "${command}"
        } else {
            bat "chcp 1251\n${command}"
        }
    }

  }
  stage('Контроль технического долга'){ 

    if (env.QASONAR) {
             
        println env.QASONAR;
        def sonarcommand = "@\"./../../../tools/hudson.plugins.sonar.SonarRunnerInstallation/Main_Classic/bin/sonar-scanner\""
        withCredentials([[$class: 'StringBinding', credentialsId: env.SonarOAuthCredentianalID, variable: 'SonarOAuth']]) {
            sonarcommand = sonarcommand + " -Dsonar.host.url=http://sonar.silverbulleters.org -Dsonar.login=${env.SonarOAuth}"
        }
        
        // Get version
        def configurationText = readFile encoding: 'UTF-8', file: 'package.json'
        def configurationVersion = (configurationText =~ /"version": "(.*)",/)[0][1]
        sonarcommand = sonarcommand + " -Dsonar.projectVersion=${configurationVersion}"

        def makeAnalyzis = true
        if (env.BRANCH_NAME == "develop") {
            echo 'Analysing develop branch'
        } else if (env.BRANCH_NAME.startsWith("release/")) {
            sonarcommand = sonarcommand + " -Dsonar.branch=${BRANCH_NAME}"
        } else if (env.BRANCH_NAME.startsWith("PR-")) {
            // Report PR issues           
            def PRNumber = env.BRANCH_NAME.tokenize("PR-")[0]
            def gitURLcommand = 'git config --local remote.origin.url'
            def gitURL = ""
            
            if (isUnix()) {
                gitURL = sh(returnStdout: true, script: gitURLcommand).trim() 
            } else {
                gitURL = bat(returnStdout: true, script: gitURLcommand).trim() 
            }
            
            def repository = gitURL.tokenize("/")[2] + "/" + gitURL.tokenize("/")[3]
            repository = repository.tokenize(".")[0]
            withCredentials([[$class: 'StringBinding', credentialsId: env.GithubOAuthCredentianalID, variable: 'githubOAuth']]) {
                sonarcommand = sonarcommand + " -Dsonar.analysis.mode=issues -Dsonar.github.pullRequest=${PRNumber} -Dsonar.github.repository=${repository} -Dsonar.github.oauth=${env.githubOAuth}"
            }
        } else {
            makeAnalyzis = false
        }

        if (makeAnalyzis) {
            if (isUnix()) {
                sh '${sonarcommand}'
            } else {
                bat "${sonarcommand}"
            }
        }
    } else {
        echo "QA runner not installed"
    }
  }
  
}
