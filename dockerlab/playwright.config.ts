import { defineConfig } from '@playwright/test';
const localChrome=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
export default defineConfig({testDir:'./e2e',timeout:45000,use:{baseURL:'http://127.0.0.1:5173',headless:true,viewport:{width:1500,height:1000},launchOptions:localChrome?{executablePath:localChrome}:{}},webServer:{command:'npm run dev -- --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:true,timeout:30000},reporter:'list'});
