#!/usr/bin/env node
// Manual operator CLI, OFF unless --publish and explicit confirmation phrase.
import {readFile} from 'node:fs/promises';
import {buildFacebookDraft,publishFacebook,TEST_PAGE_ID} from '../lib/cc-social-publisher/facebook.mjs';
const args=process.argv.slice(2);
const publish=args.includes('--publish');
const filename=args.find(s=>s.endsWith('.json'));
if(!filename)throw new Error('Usage: node scripts/cc-facebook-publisher.mjs path/to/approved.json [--publish]');
const job=JSON.parse(await readFile(filename,'utf8'));
if(job.channel!=='facebook_page'||job.approved!==true)throw new Error('Approved Facebook Page job is required');
const draft=buildFacebookDraft({pageId:job.pageId||TEST_PAGE_ID,message:job.message});
if(publish && process.env.CC_FACEBOOK_CONFIRM!=='PUBLISH_APPROVED_FACEBOOK_POST')throw new Error('Explicit publish confirmation required');
const result=await publishFacebook({pageId:draft.pageId,message:draft.message,token:process.env.META_PAGE_ACCESS_TOKEN,confirm:publish});
console.log(JSON.stringify(result,null,2));
