/* Cambridge Digital Catalogue — request submission contract + live backend adapter */
(function () {
  "use strict";

  const SCHEMA_VERSION="1.2",CATALOGUE_VERSION="2026-27",ORDER_KEY="cambridgeOrder",REQUEST_KEY="cambridgeRequestDetails",ATTEMPT_KEY="cpcRequirementAttemptKey",MAX_QUANTITY=10000;
  const SUBMISSION_URL="https://ysaxagxortpxyifyaydx.supabase.co/functions/v1/submit-catalogue-request";

  const text=value=>value==null?"":String(value).trim();
  const nullable=value=>{const v=text(value);return v||null};
  const numberOrNull=value=>{const n=Number(value);return Number.isFinite(n)?n:null};
  function readJSON(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||"null");return value==null?fallback:value}catch(e){return fallback}}
  function catalogueProducts(){return Array.isArray(window.CAMBRIDGE_CATALOGUE)?window.CAMBRIDGE_CATALOGUE:[]}
  function findMasterProduct(item){const products=catalogueProducts();if(item&&item.id){const x=products.find(p=>p&&p.id===item.id);if(x)return x}if(item&&item.sku){const x=products.find(p=>p&&p.sku&&p.sku===item.sku);if(x)return x}if(item&&item.isbn){const x=products.find(p=>p&&p.isbn&&p.isbn===item.isbn);if(x)return x}return null}
  function classArray(value){const a=Array.isArray(value)?value:[value];return [...new Set(a.map(text).filter(Boolean))]}
  function backendClass(value){const a=classArray(value);return a.length===1?a[0]:(a.length?a.join(", "):null)}
  function normalQuantity(value){const n=Number(value);if(!Number.isSafeInteger(n)||n<1||n>MAX_QUANTITY)throw new Error("Invalid request quantity.");return n}
  function publicationId(item){const id=text(item&&item.id);if(!id)throw new Error("A selected publication is missing its catalogue ID.");return id}
  function bookLine(item){return{type:"book",publicationId:publicationId(item),quantity:normalQuantity(item.quantity)}}
  function kitLine(item){const type=item&&item.type==="standard-kit"?"standard-kit":"custom-kit",level=text(item&&item.level).toLowerCase(),bookIds=Array.isArray(item&&item.books)?item.books.map(publicationId):[];if(!level||!bookIds.length)throw new Error("A Kit is missing its stage or selected publications.");return{type,level,kitName:type==="custom-kit"?nullable(item.kitName||item.title):null,publicationIds:bookIds,quantity:normalQuantity(item.quantity)}}
  function customerPayload(details){const whatsapp=details.whatsappSameAsMobile?details.mobile:details.whatsapp;return{customerType:nullable(details.customerType),contactName:nullable(details.contactName),organisationName:nullable(details.organisationName),mobile:nullable(details.mobile),whatsapp:nullable(whatsapp),email:nullable(details.email),preferredContact:nullable(details.preferredContact||"call"),location:{city:nullable(details.city),district:nullable(details.district),state:nullable(details.state),pincode:nullable(details.pincode)},existingCambridgeCustomer:nullable(details.existingCustomer),notes:nullable(details.notes)}}
  function buildPayload(){const order=readJSON(ORDER_KEY,[]),details=readJSON(REQUEST_KEY,{});if(!Array.isArray(order)||!order.length)throw new Error("The request has no selected items.");const lines=order.map(item=>item&&(item.type==="custom-kit"||item.type==="standard-kit")?kitLine(item):bookLine(item||{}));return{customer:customerPayload(details),notes:nullable(details.notes),items:lines}}
  function attemptKey(){let key="";try{key=sessionStorage.getItem(ATTEMPT_KEY)||"";if(!key&&window.crypto&&typeof window.crypto.randomUUID==="function"){key=window.crypto.randomUUID();sessionStorage.setItem(ATTEMPT_KEY,key)}}catch(e){}if(!key)throw new Error("Your browser cannot prepare a safe retry key. Please try again.");return key}
  function buildBackendPayload(){return{...buildPayload(),idempotencyKey:attemptKey()}}
  async function submit(adapter){if(!adapter||typeof adapter.submit!=="function")throw new Error("Request submission service is not connected.");const payload=buildPayload(),result=await adapter.submit(payload);if(!result||!result.requestId)throw new Error("The request was not confirmed by the submission service.");return{payload,result}}
  async function submitLive(){const payload=buildBackendPayload();const response=await fetch(SUBMISSION_URL,{method:"POST",headers:{"Content-Type":"application/json","Idempotency-Key":payload.idempotencyKey},body:JSON.stringify(payload)});let result=null;try{result=await response.json()}catch(e){}if(!response.ok||!result||result.ok!==true||!result.reference)throw new Error(result&&result.error?result.error:"We could not submit your request. Please try again.");return result}
  function clearSubmittedDraft(){localStorage.removeItem(ORDER_KEY);localStorage.removeItem(REQUEST_KEY);sessionStorage.removeItem(ATTEMPT_KEY)}

  window.CambridgeRequestSubmission=Object.freeze({SCHEMA_VERSION,CATALOGUE_VERSION,buildPayload,buildBackendPayload,attemptKey,submit,submitLive,clearSubmittedDraft});
})();
