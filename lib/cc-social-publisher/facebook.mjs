// Official Meta Graph API adapter. No credentials are persisted or logged.
const GRAPH_VERSION = 'v26.0';
export const TEST_PAGE_ID = '418082804722236';

export function buildFacebookDraft({pageId, message}) {
  if (!/^[0-9]{5,30}$/.test(String(pageId ?? ''))) throw new Error('Invalid Page ID');
  if (typeof message !== 'string' || !message.trim() || message.length > 60000) throw new Error('Invalid message');
  return Object.freeze({pageId:String(pageId),message:message.trim(),endpoint:`/${pageId}/feed`});
}

async function graphRequest({path,method='GET',token,params={},fetchImpl=fetch}) {
  if (!token || typeof token !== 'string') throw new Error('Missing Meta Page Access Token');
  const url=new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path.replace(/^\//,'')}`);
  const headers={Authorization:`Bearer ${token}`};
  let body;
  if(method==='GET') for(const [k,v] of Object.entries(params))url.searchParams.set(k,String(v));
  else {body=new URLSearchParams(params);headers['Content-Type']='application/x-www-form-urlencoded';}
  const response=await fetchImpl(url.toString(),{method,headers,body,redirect:'error'});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||data.error)throw new Error(`Meta API rejected request: status ${response.status}, code ${data.error?.code ?? 'unknown'}`);
  return data;
}

export async function verifyPage({pageId,token,fetchImpl=fetch}) {
  const data=await graphRequest({path:`${pageId}`,token,params:{fields:'id,name'},fetchImpl});
  if(String(data.id)!==String(pageId))throw new Error('Token is not authorized for requested Page');
  return {id:String(data.id),name:data.name};
}

export async function findExistingPost({pageId,message,token,fetchImpl=fetch,limit=100}) {
  const data=await graphRequest({path:`${pageId}/posts`,token,params:{fields:'id,message,permalink_url',limit:Math.min(limit,100)},fetchImpl});
  return (data.data||[]).find(p=>p.message?.trim()===message.trim())||null;
}

export async function publishFacebook({pageId,message,token,fetchImpl=fetch,confirm=false}) {
  const draft=buildFacebookDraft({pageId,message});
  if(!confirm) return {status:'dry_run',pageId:draft.pageId,preview:draft.message};
  await verifyPage({pageId:draft.pageId,token,fetchImpl});
  const previous=await findExistingPost({pageId:draft.pageId,message:draft.message,token,fetchImpl});
  if(previous)return {status:'existing',id:previous.id,url:previous.permalink_url||null};
  const result=await graphRequest({path:`${pageId}/feed`,method:'POST',token,params:{message:draft.message},fetchImpl});
  if(!/^[0-9]+_[0-9]+$/.test(result.id||''))throw new Error('Meta did not return valid post id; inspect before retrying');
  return {status:'submitted',id:result.id,url:`https://www.facebook.com/${result.id.replace('_','/posts/')}`};
}
