//===========================================================
// ================ example use init script =================
//===========================================================
// (function () {
//   const arguments = {
//     PXID,
//     clearDataFields: ['email','phone','fullname','price','course','campaign','mkter','px','redirect_url','callback_url','params','discountCode']
//   };
//   const {userAgent, dealId} = init(arguments,()=>{
//     window.dataLayer = window.dataLayer || [];
//     window.dataLayer.push({'event':'FSInit', 'PXID': PXID});
//     fbq('init',  PXID);
//     fbq('track', 'PageView');
//   });
// })()
//===========================================================
// ================ example use init script =================
//===========================================================

function init(arguments, callback) {
  const isPass = checkFieldsRequireFully(arguments.hiddenFieldConfig);
  if (!isPass) return isPass;
  const userAgent = appendUserAgent(arguments.PXID);
  const dealId = genDealId();
  clearDataLocalStorage(arguments.clearDataFields);

  //==================== Start => add deal_id into all input deal_id elements ====================
  var dealIdElements = document.getElementsByName('deal_id');
  if (dealIdElements.length) {
    for (const dealIdElement of dealIdElements) {
      dealIdElement.value = dealId;
    }
  } else {
    console.log('%cinput "deal_id" not define!', 'color: red; font-size: larger');
  }
  //==================== End => add deal_id into all input deal_id elements ====================

  //==================== Start => add px into all input px elements ====================
  var pxElements = document.getElementsByName('px');
  if (pxElements.length) {
    for (const pxElement of pxElements) {
      pxElement.value = userAgent;
    }
  } else {
    console.log('%cinput "px" not define!', 'color: red; font-size: larger');
  }
  //==================== End => add px into all input px elements ====================

  //==================== Start => add landing_url into all input landing_url elements ====================
  var landingUrls = document.getElementsByName('landing_url');
  if (landingUrls.length) {
    for (const landingUrl of landingUrls) {
      landingUrl.value = window.location.href;
    }
  } else {
    console.log('%cinput "landing_url" not define!', 'color: red; font-size: larger');
  }
  //==================== End => add landing_url into all input landing_url elements ====================
  if (callback) callback();
  return {
    userAgent,
    dealId,
  };
}

function checkFieldsRequireFully(hiddenFieldConfig) {
  const defaultFields = ['email', 'fullname', 'phone', 'search', 'address'];
  const defaultHiddenFields = [
    'px',
    'sub_district',
    'district',
    'province',
    'zipcode',
    'discountCode',
    'channel',
    'channel_name',
    'deal_id',
    'landing_url',
    'type',
  ];
  const concateArr = [...defaultFields, ...defaultHiddenFields];
  for (const defaultField of concateArr) {
    if (!document.querySelectorAll(`input[name="${defaultField}"]`).length) {
      alert(`คุณไม่ได้ใส่ Field ${defaultField}`);
      return false;
    }
  }

  for (const hiddenField of Object.keys(hiddenFieldConfig)) {
    if (!document.querySelectorAll(`input[name="${hiddenField}"]`).length || !hiddenFieldConfig[hiddenField].length) {
      if (!hiddenFieldConfig[hiddenField].length) {
        alert(`คุณไม่ได้ใส่ค่าใน Field ${hiddenField}`);
        return false;
      }
      alert(`คุณไม่ได้ใส่ Field ${hiddenField}`);
      return false;
    }
  }
  return true;
}

function blockSpam(formProps) {
  console.log('formProps', formProps);
  return false;
  // if (RegExp('charan.p|Zz656').test(formProps) || RegExp('ชรัญเพ็ง|ชัณเพ็ง').test(name)) return false;
  // return true;
}

function genDealId() {
  var d = new Date().toISOString().substring(0, 10);
  var dd = d.split('-').join('');
  var rand = Math.round(Math.random() * 1000000);
  const deal_id = dd + rand;
  return deal_id;
}

function appendUserAgent(PXID) {
  const l = window.location;
  const px = PXID + '|' + window.navigator.userAgent + '|' + l.protocol + '//' + l.host + l.pathname;
  return px;
}

function clearDataLocalStorage(fields) {
  fields.map(field => {
    localStorage.setItem(field, '');
  });
}

function validatePhone(phone) {
  if (!phone) return undefined;
  phone = phone.replace(/(\s+|-|\+66|^66|^0)/g, '0');
  if (phone.length !== 10) return undefined;
  return phone;
}

function correctName(name) {
  name = name
    .replace(/^(นาย|นางสาว|น.ส.|ด.ช.|ด.ญ.|นาง|คุณ|เด็กชาย|เด็กหญิง)/g, '')
    .replace(/\s\s+/g, ' ')
    .trim();
  return name;
}

//==========================================================================================================================

function listenerForm(feildNames) {
  //=========== set default package into package select option ============
  const defaultPackage = document.querySelector('input[name="defaultPackage"]');
  if (defaultPackage) {
    document.querySelectorAll('select[name="package"]').forEach(function (element) {
      element.value = defaultPackage.value;
    });
    const _defaultPackage = defaultPackage.value.split('/');
    document.querySelector('input[name="discountCode"]').value = _defaultPackage[2] || '';
    document.querySelector('input[name="course"]').value = _defaultPackage[0];
    document.querySelector('input[name="price"]').value = _defaultPackage[1];
    //=========== set default package into package select option ============

    document.body.addEventListener('change', function (event) {
      //========= package select option on change into other package select option =============
      if (event.target.name === 'package') {
        document.querySelectorAll('select[name="package"]').forEach(function (element) {
          element.value = event.target.value;
        });
        const _package = event.target.value.split('/');
        document.querySelector('input[name="discountCode"]').value = _package[2] || '';
        document.querySelector('input[name="course"]').value = _package[0];
        document.querySelector('input[name="price"]').value = _package[1];
      }
      //========= package select option on change into other package select option =============
    });
  }

  document.addEventListener(
    'submit',
    event => {
      const formData = new FormData(event.target);
      const formProps = Object.fromEntries(formData);
      const block = blockSpam(formProps);
      if (!block) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        alert('blocked user spam');
        return block;
      }

      delete formProps.defaultPackage;
      delete formProps.package;

      // ===================== Start = > set localStorage =====================
      for (const feildName of feildNames) {
        if (feildName === 'fullname') {
          const name = correctName(formProps[feildName]);
          localStorage.setItem(feildName, name);
        } else if (feildName === 'phone') {
          const phone = validatePhone(formProps[feildName]);
          if (!phone) {
            alert('กรุณากรอกข้อมูลสำหรับติดต่อให้ถูกต้อง');
            event.preventDefault();
            clearDataLocalStorage(feildNames);
            break;
          }
          localStorage.setItem(feildName, phone);
        } else if (feildName === 'course') {
          if (formProps.orderbump && formProps.orderbumpdetail) {
            formProps[feildName] += `,${formProps.orderbumpdetail.trim()}`;
          }
          localStorage.setItem(feildName, formProps[feildName]);
        } else if (feildName === 'params') {
          const urlSearchParams = new URLSearchParams(window.location.search);
          const params = Object.fromEntries(urlSearchParams.entries());
          localStorage.setItem(feildName, JSON.stringify(params));
        } else {
          localStorage.setItem(feildName, formProps[feildName] || '');
        }
      }
      // ===================== End = > set localStorage =====================
    },
    true
  );
}

async function submitPayment(localStorageItems) {
  const {ip} = await getIp();
  const dataFromLocalStorage = getDataFromLocalStorage(localStorageItems);
  const redirectQuery = new URLSearchParams({
    dealId: dataFromLocalStorage['deal_id'],
    email: dataFromLocalStorage['email'],
    fullName: dataFromLocalStorage['fullname'],
    phone: dataFromLocalStorage['phone'],
    price: dataFromLocalStorage['price'],
    discountCode: dataFromLocalStorage['discountCode'],
  }).toString();

  const courses = dataFromLocalStorage['course'] ? dataFromLocalStorage['course'].split(',') : [];
  const payload = {userId: undefined, redeem: true, type: dataFromLocalStorage['type']};

  if (courses.length) {
    const cartItems = courses.map(product => {
      return {
        product: product,
        quantity: 1,
      };
    });
    var data = {
      cartItems,
      userdata: {
        email: dataFromLocalStorage['email'],
        tel: dataFromLocalStorage['phone'] || '',
        fullName: dataFromLocalStorage['fullname'] || '',
      },
      cartTracking: {
        convertionId: conversion?.hash || '',
        campaign: dataFromLocalStorage['campaign'] || '',
        seller: dataFromLocalStorage['mkter'] || '',
        channel: 'SGC',
        ip: ip,
        utm_source: dataFromLocalStorage['query']?.utm_source || '',
        utm_medium: dataFromLocalStorage['query']?.utm_medium || '',
        utm_campaign: dataFromLocalStorage['query']?.utm_campaign || '',
        utm_term: dataFromLocalStorage['query']?.utm_term || '',
        utm_content: dataFromLocalStorage['query']?.utm_content || '',
        customField1: dataFromLocalStorage['deal_id'],
        customField2: dataFromLocalStorage['px'],
      },
      paymentSuccessRedirectUrl: `${dataFromLocalStorage['redirect_url']}?${redirectQuery}`,
    };

    if (dataFromLocalStorage['type'] && dataFromLocalStorage['type']?.length) data.userdata.payload = payload;

    if (dataFromLocalStorage['callback_url']) data.paymentSuccessCallbackUrl = dataFromLocalStorage['callback_url'];

    var url = await createCart(data);
    if (dataFromLocalStorage['discountCode']) url = `${url}?discountCode=${dataFromLocalStorage['discountCode']}`;

    setTimeout(function () {
      window.location.replace(url);
    }, 1500);
  }
}

function getDataFromLocalStorage(localStorageItems) {
  const dataFromLocalStorage = {};
  for (const localStorageItem of localStorageItems) {
    if (localStorageItem === 'params') {
      dataFromLocalStorage[localStorageItem] = JSON.parse(localStorage.getItem(localStorageItem) || {});
    } else {
      dataFromLocalStorage[localStorageItem] = localStorage.getItem(localStorageItem);
    }
  }
  return dataFromLocalStorage;
}

async function createCart(cart) {
  var data = await fetchPost('https://pay-api.futureskill.co/api/cart/create', cart, {
    'Content-Type': 'application/json',
    Authorization: 'Basic NzAyMTg2NzcwNzY0ODMzMDQ6ejE5ZmpmckZrMGZuUVFRTUc0UHQ=',
  });
  return data.url;
}

async function getIp() {
  const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
  let data = await response.text();
  data = data
    .trim()
    .split('\n')
    .reduce(function (obj, pair) {
      pair = pair.split('=');
      return (obj[pair[0]] = pair[1]), obj;
    }, {});
  return data;
}

async function fetchPost(url, data, headers) {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  return response.json();
}
