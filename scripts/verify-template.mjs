// Tests original n8n Code-node logic using synthetic fixtures only.
// A successful test is not proof of a fresh import into the n8n editor.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
const here=dirname(fileURLToPath(import.meta.url));
const wf=JSON.parse(readFileSync(resolve(here,'../workflows/synthetic-b2b-request-triage.json'),'utf8'));
assert.equal(wf.active,false);
assert.equal(wf.nodes.length,10);
const byName=new Map(wf.nodes.map(n=>[n.name,n]));
assert.equal(byName.size,wf.nodes.length);
const permittedTypes=new Set(['n8n-nodes-base.manualTrigger','n8n-nodes-base.code','n8n-nodes-base.set','n8n-nodes-base.switch','n8n-nodes-base.stickyNote']);
for(const n of wf.nodes){
 assert.ok(permittedTypes.has(n.type),'Unexpected type: '+n.type);
 assert.equal(Boolean(n.credentials),false,'No credentials allowed');
 assert.equal(Boolean(n.webhookId),false,'No live webhooks allowed');
}
for(const [source,links] of Object.entries(wf.connections)){
 assert.ok(byName.has(source),'Missing source '+source);
 for(const output of (links.main||[]))for(const link of (output||[]))assert.ok(byName.has(link.node),'Missing target '+link.node);
}
function executeCode(name,input){
 const n=byName.get(name);
 assert.equal(n?.type,'n8n-nodes-base.code');
 const context={$input:{all:()=>input}};
 const expression='(function(){\n'+n.parameters.jsCode+'\n})()';
 const result=runInNewContext(expression,context,{timeout:500});
 assert.ok(Array.isArray(result));
 return result;
}
const fixtures=executeCode('Generate Synthetic Requests',[{json:{}}]);
assert.equal(fixtures.length,4);
const routed=executeCode('Validate and Classify',fixtures);
const expected={'DEMO-001':'qualified','DEMO-002':'manual_review','DEMO-003':'do_not_contact','DEMO-004':'manual_review'};
for(const item of routed){assert.equal(item.json.synthetic,true);assert.equal(item.json.route,expected[item.json.requestId]);}
const edge=executeCode('Validate and Classify',[
 {json:{requestId:'E1',email:'valid@example.com',service:'AI',contactPermission:false}},
 {json:{requestId:'E2',email:'invalid',service:'AI',contactPermission:true}},
 {json:{requestId:'E3',email:'valid@example.com',service:'',contactPermission:true}}
]);
assert.deepEqual(Array.from(edge,x=>x.json.route),['do_not_contact','manual_review','manual_review']);
const sw=byName.get('Route Requests with Fallback');
assert.equal(sw.parameters.rules.values.length,3);
assert.equal(sw.parameters.options.fallbackOutput,'extra');
assert.equal(wf.connections[sw.name].main.length,4);
console.log('PASS: 10 nodes, 4 samples, 3 adversarial checks, 4 switch paths, no credentials.');
