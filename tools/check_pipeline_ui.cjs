const {chromium}=require('../executors/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]+'/#batches');
  await page.locator('[data-action="new-batch"]').click();
  await page.locator('[name="urls"]').fill('https://example.org/isolated-a\nhttps://example.org/isolated-b');
  await page.locator('#dialog-form .primary').click();
  await page.getByText('新建 2 个任务，复用 0 个已有任务。').waitFor();
  await page.locator('[data-batch-detail]').filter({hasText:'查看新批次'}).click();
  await page.locator('.modal [data-job]').first().click();
  await page.locator('.pipeline').waitFor();
  assert.equal(await page.locator('.pipeline li').count(),9);
  assert.equal(await page.locator('.pipeline li').filter({hasText:'AI 诊断与修复'}).count(),1);
  assert.equal(await page.locator('.pipeline [data-status="succeeded"]').count(),0);
  await page.route('**/api/state',async route=>{
    const response=await route.fetch(); const state=await response.json();
    const j=state.jobs[0];
    j.status='failed';j.round=2;j.reason='隔离检查：资源尚未完整';
    j.pipeline={current:'adapt',note:'隔离展示检查',nodes:[{key:'adapt',label:'Web 适配',status:'failed',reason:j.reason,
      executions:[{id:'run-1',number:1,status:'failed',started_at:'2026-10-20T09:00:00+08:00',ended_at:'2026-10-20T09:01:00+08:00',message:'第一次检查异常'},
        {id:'run-2',number:2,status:'failed',started_at:'2026-10-20T09:02:00+08:00',ended_at:'2026-10-20T09:03:00+08:00',message:'重试后仍有缺项'}],
      records:[{event_id:'fixture-node',message:j.reason,time:'2026-10-20T09:00:00+08:00',round:2}]}]};
    state.events=[
      {id:'fixture-node',job_id:j.id,message:j.reason,created_at:'2026-10-20T09:00:00+08:00',round:2},
      {id:'fixture-extra',job_id:j.id,message:'独有补充日志',created_at:'2026-10-20T09:01:00+08:00',round:2},
      {id:'fixture-older',job_id:j.id,message:j.reason,created_at:'2026-10-19T09:00:00+08:00',round:1}
    ];
    state.rounds=[{candidate_id:j.candidate_id,round:2,status:'failed',reason:j.reason}];
    state.messages=[
      {candidate_id:j.candidate_id,job_id:j.id,round:2,role:'user',text:'修改角色移动速度',presentation:'request'},
      {candidate_id:j.candidate_id,job_id:j.id,round:2,role:'assistant',text:'隔离执行汇报',presentation:'progress'},
      {candidate_id:j.candidate_id,job_id:j.id,round:2,role:'assistant',text:'隔离旧消息',presentation:'legacy'}
    ];
    await route.fulfill({response,json:state});
  });
  await page.goto(process.argv[2]+'/#jobs');
  await page.reload();
  await page.locator('[data-job]').first().click();
  await page.locator('.pipeline').waitFor();
  assert.equal(await page.locator('.modal').getByText('隔离检查：资源尚未完整',{exact:true}).count(),0);
  assert.equal(await page.locator('.pipeline').getByText(/隔离检查：资源尚未完整/).count(),1);
  assert.equal(await page.locator('.task-history').getByText(/隔离检查：资源尚未完整/).count(),1); // Earlier round retained.
  assert.equal(await page.locator('.task-history').getByText(/独有补充日志/).count(),1);
  assert.equal(await page.locator('.task-history [data-job]').count(),0);
  assert.equal(await page.locator('.task-conversation').getByText('修改角色移动速度',{exact:true}).count(),1);
  assert.equal(await page.locator('.task-conversation').getByText('隔离执行汇报',{exact:true}).count(),0);
  assert.equal(await page.locator('.task-progress-reports').getByText('隔离执行汇报',{exact:true}).count(),1);
  assert.equal(await page.locator('.task-legacy-messages').getByText('隔离旧消息',{exact:true}).count(),1);
  await page.locator('.pipeline-evidence > summary').click();
  assert.equal(await page.locator('.pipeline-executions').getByText(/第 1 次 · 失败/).count(),1);
  assert.equal(await page.locator('.pipeline-executions').getByText(/第 2 次 · 失败/).count(),1);
  await page.screenshot({path:'qa-output/pipeline-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'qa-output/pipeline-mobile.png'});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
