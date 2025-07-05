#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function checkFile(filePath, description) {
  const fullPath = join(rootDir, filePath);
  if (existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description}: ${filePath} (缺失)`);
    return false;
  }
}

function checkPackageJson() {
  try {
    const packagePath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    
    console.log('\n📦 Package.json 检查:');
    
    const required = ['name', 'version', 'description', 'main', 'author', 'license'];
    let valid = true;
    
    required.forEach(field => {
      if (packageJson[field]) {
        console.log(`✅ ${field}: ${JSON.stringify(packageJson[field])}`);
      } else {
        console.log(`❌ ${field}: 缺失`);
        valid = false;
      }
    });
    
    // 检查作者信息是否需要更新
    if (packageJson.author && packageJson.author.name === 'Your Name') {
      console.log(`⚠️  author.name 需要更新: ${packageJson.author.name}`);
      valid = false;
    }
    
    // 检查仓库信息是否需要更新
    if (packageJson.repository && packageJson.repository.url.includes('yourusername')) {
      console.log(`⚠️  repository.url 需要更新: ${packageJson.repository.url}`);
      valid = false;
    }
    
    return valid;
  } catch (error) {
    console.log(`❌ Package.json 解析错误: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🔍 NPM 发布前检查\n');
  
  let allValid = true;
  
  // 检查必要文件
  console.log('📄 必要文件检查:');
  allValid &= checkFile('package.json', 'Package 配置');
  allValid &= checkFile('README.md', '项目文档');
  allValid &= checkFile('LICENSE', '许可证文件');
  allValid &= checkFile('index.js', '主入口文件');
  allValid &= checkFile('FEATURES.md', '功能说明');
  
  // 检查 package.json 内容
  allValid &= checkPackageJson();
  
  // 检查环境
  console.log('\n🔧 环境检查:');
  console.log(`✅ Node.js 版本: ${process.version}`);
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('🎉 所有检查通过！可以发布到 NPM');
    console.log('\n📝 发布步骤:');
    console.log('1. npm login');
    console.log('2. npm publish');
  } else {
    console.log('⚠️  请修复上述问题后再发布');
    process.exit(1);
  }
}

main(); 