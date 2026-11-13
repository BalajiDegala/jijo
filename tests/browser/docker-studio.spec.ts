import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';

async function command(page: Page, cmd: string) {
  const field = page.getByRole('textbox',{name:'Docker command'});
  await field.fill(cmd);
  await field.press('Enter');
  await expect(page.getByRole('region',{name:'Terminal output'})).toContainText('$ '+cmd);
}
test('Docker opens at the terminal, projects persist independently and Q69 verifies connectivity', async ({page})=>{
  await page.goto('/');
  await page.getByRole('link',{name:/Docker.*Open module/}).click();
  const nav=page.getByRole('navigation',{name:'Docker module'});
  await command(page,'docker pull nginx');
  await command(page,'docker run -d --name blue nginx');
  const blue=page.getByRole('group',{name:'blue, Container',exact:true});
  await expect(blue).toContainText('running');
  await command(page,'docker stop blue');
  await expect(blue).toContainText('exited');
  await page.getByRole('button',{name:'Commands',exact:true}).click();
  await page.getByRole('textbox',{name:'Find a command'}).fill('docker ps -a');
  await page.getByRole('button',{name:'Containers docker ps -a Include exited containers.',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Docker command'})).toHaveValue('docker ps -a');
  await command(page,'docker container ls -a --format "{{.Names}} {{.State}}"');
  await expect(page.getByRole('region',{name:'Terminal output'})).toContainText('blue exited');
  await page.screenshot({path:'test-results/docker-terminal-playground.png'});
  await nav.getByRole('link',{name:'Templates'}).click();
  await expect(page.getByRole('heading',{name:'One Nginx service'})).toBeVisible();
  await expect(page.locator('.runtime-output')).toContainText('200 OK');
  await page.getByRole('button',{name:/Flask \+ PostgreSQL A web app/}).click();
  await expect(page.locator('.template-services')).toContainText('database');
  await page.getByRole('button',{name:'Open a copy'}).click();
  await expect(page.getByRole('combobox',{name:'Workspace'})).toContainText('Flask + PostgreSQL');
  await nav.getByRole('link',{name:'Scenarios'}).click();
  await page.getByText('Interview guide index · 80 questions').click();
  await page.getByRole('searchbox').fill('Q80');
  await expect(page.getByText('Investigate repeated CI cache misses',{exact:false}).last()).toBeVisible();
  await page.getByRole('button',{name:/Q69/}).click();
  await page.getByRole('button',{name:'Verify repair'}).click();
  await expect(page.getByText('Needs work · A working network path exists')).toBeVisible();
  await command(page,'docker network connect app-network postgres');
  await page.getByRole('button',{name:'Verify repair'}).click();
  await expect(page.getByText('Passed · A working network path exists')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Repair verified.')).toBeVisible();
  await nav.getByRole('link',{name:'Playground',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Workspace'}).locator('option:checked')).toHaveText('Flask + PostgreSQL');
  await page.getByRole('combobox',{name:'Workspace'}).selectOption('home');
  await expect(blue).toContainText('exited');
});

test('mobile playground exposes commands and graph actions with no horizontal overflow', async ({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#docker');
  await command(page,'docker run -d --name web nginx');
  await command(page,'docker network create backend');
  const web=page.getByRole('group',{name:'web, Container',exact:true});
  await web.click({button:'right'});
  await page.getByRole('button',{name:'Connect',exact:true}).click();
  await page.getByRole('group',{name:'backend, Network',exact:true}).click();
  await expect(page.getByRole('region',{name:'Terminal output'})).toContainText('Connected web to backend');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.addScriptTag({content:axe.source});
  const issues=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:['wcag2a','wcag2aa','wcag21a','wcag21aa']})).violations.map(v=>({id:v.id,selector:v.nodes.map(n=>n.target)})));
  expect(issues).toEqual([]);
});
