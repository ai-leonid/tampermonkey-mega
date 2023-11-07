// ==UserScript==
// @name         Megamarket extra fields and sorts
// @namespace    http://tampermonkey.net/
// @version      1.6.1
// @description  Сортировка на странице по баллам и цены товаров с учётом баллов.
// @author       ai-leonid
// @match        *://megamarket.ru/*
// @icon         *://www.google.com/s2/favicons?sz=64&domain=megamarket.ru
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// ==/UserScript==

(function() {
  /* ---------- CONSTANTS AND ELEMS ---------- */
  const stylesCatalogList = `
  <style>
    /* CUSTOM RULES REPAIR */
    .catalog-listing__items .item-price,
    .cnc-catalog-listing__items .item-price,
    .personal-listing-items .item-price {
      opacity: 0.6;
    }
    
    .catalog-listing-header.no-border-filters {
       margin-bottom: 4px;
    }
    
    .catalog-listing-header .catalog-listing-header-wrapper {
      border-bottom: none !important;
      padding-bottom: 8px !important;
    }
    /* END CUSTOM RULES REPAIR */
  
    .js-init-check-list {
      display: none;
    }
  
    /* money-benefit in card */
    .money-benefit { 
        display: flex;
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 8px;
        padding-right: 8px;
        border: 1px solid #8654cc;
        border-radius: 12px;
        margin-bottom: 15px;
        background: var(--pui-bg-layer-02-medium);
     }
                 
    .money-benefit .benefit-item { 
      display: flex;
      justify-content: space-between;
      width: 100%;
      font-size: 12px;
    }
    
    .money-benefit .benefit-item .val { 
      font-weight: bold;
      font-size: 16px;
    }

    /* custom actions filter */    
    .custom-actions-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      width: 100%;
      margin-right: auto;
      flex-wrap: wrap;
      padding-bottom: 18px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--pui-border-secondary);
    }
    
    .custom-actions-wrapper .custom-actions-item {
      position: relative;
      padding-bottom: 20px;
    }
    
    .custom-actions-wrapper .custom-actions-item span {
      color: var(--pui-text-primary);
      font-size: 10px;
    }
    
    .custom-actions-wrapper .custom-actions-item .custom-notion {
      position: absolute;
      bottom: 0;
      left: 0;
      font-size: 9px;
      opacity: 0.7;
    }

    .custom-actions-wrapper .select-item-wrapper {
      width: 100%;
      max-width: 300px;
    }
    
    .custom-actions-wrapper .input-item-wrapper {
      width: 100%;
      max-width: 120px;
    }
    
    .custom-actions-wrapper .custom-select-sort {
      background-color: var(--pui-bg-layer-01);
      border: 1px solid var(--pui-border-primary);
      border-radius: 8px;
      box-sizing: border-box;
      color: var(--pui-text-primary);
      cursor: text;
      display: block;
      font-size: 14px;
      font-weight: 400;
      height: 36px;
      line-height: 20px;
      margin: 0;
      min-height: 36px;
      outline: none;
      padding: 0 1em;
      padding-right: 1em;
      transition: border-color .2s;
      vertical-align: baseline;
      width: 100%;
      word-spacing: 0;
    }
    
    .custom-actions-wrapper .custom-input-page {
      background: transparent;
      font-family: SB Sans Text,sans-serif;
      height: 36px;
      min-height: 36px;
      font-size: 14px;
      letter-spacing: -.02em;
      line-height: 18px;
      border-radius: 8px;
      padding: 8px;
      border: 1px solid var(--pui-border-primary);
      width: 100%;
    }
    
    .custom-actions-wrapper .upper-load-btn {
      margin-top: auto;
      margin-bottom: auto;
    }
    
    .custom-actions-wrapper .upper-load-btn .spinner-inline {
      display: none;
      margin-left: 5px;
    }
    
    .custom-actions-wrapper .upper-load-btn.is-loading .spinner-inline {
      display: inline-block;
    }
    
    .custom-actions-wrapper .custom-total-counter {
      position: absolute;
      font-size: 12px;
      right: 0;
      bottom: 0;
    }
    
  </style>`;
  const stylesDetail = `
  <style>
      /* CUSTOM RULES REPAIR */
    .pdp-prices .product-offer-price__amount {
      opacity: 0.6;
    }
    
    .offers-info .sales-block-offer-price__price-final {
      opacity: 0.6;
    }
    /* END CUSTOM RULES REPAIR */
    
    /* price-and-bonus */
    .price-and-bonus {
      display: flex;
      padding-top: 8px;
      padding-bottom: 8px;
      padding-left: 12px;
      padding-right: 12px;
      border: 1px solid #8654cc;
      border-radius: 12px;
      margin-bottom: 15px;
      align-items: center;
      flex-direction: column;
      background: var(--pui-bg-layer-02-medium);
    }
    
    .price-and-bonus .price-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding-top: 2px;
      padding-bottom: 2px;
    }
    
    .price-and-bonus .price-item:first-child {
      border-bottom: 1px solid #BCC7CF;
    }
    
    .price-and-bonus .price-item .title { 
      font-size: 12px;
    }
    
    .price-and-bonus .price-item .val { 
      font-weight: bold;
      font-size: 18px;
    }
    
    
    /* compare-section-price-and-bonus */
    .compare-section-price-and-bonus {
      display: flex;
      padding-top: 4px;
      padding-bottom: 4px;
      border-top: 1px solid #BCC7CF;
      margin-top: 6px;
      align-items: center;
    }
    
    .compare-section-price-and-bonus .title { 
      font-size: 12px;
    }
    
    .compare-section-price-and-bonus .val { 
      font-weight: bold;
      font-size: 16px;
    }
  </style>`;
  const stylesAllItems = `
  <style>
      /* CUSTOM RULES REPAIR */
    .product-list-item .product-list-item-price .amount {
      opacity: 0.6;
      font-size: 16px;
    }
    
    .goods-item-card .goods-item-card__amount {
      opacity: 0.6;
      font-size: 16px;
    }
    
    .goods-item-card .goods-item-card__price {
      height: 84px;
      display: flex;
      flex-direction: column;
      position: relative;
    }
    
    .goods-item-card .goods-item-card__merchant-discount-badge-stub,
    .goods-item-card .goods-item-card__merchant-discount-badge {
      height: 22px;
      position: absolute;
      z-index: 10;
      width: 40px;
      top: -40px;
     }
    /* END CUSTOM RULES REPAIR */
    
    .js-init-all-items {
      display: none;
    }
    
    .custom-product-item-price {
      display: flex;
      justify-content: flex-start;
      padding-top: 4px;
      padding-bottom: 4px;
      padding-left: 6px;
      padding-right: 6px;
      border: 1px solid #8654cc;
      flex-direction: column;
      border-radius: 12px;
      margin-bottom: 4px;
      align-items: flex-start;
      background: var(--pui-bg-layer-02-medium);
    }
    
    .custom-product-item-price .title { 
      font-size: 10px;
    }
    
    .custom-product-item-price .val { 
      font-weight: bold;
      font-size: 18px;
    }
    
    
  </style>`;

  const spinnerEl = `
  <div class='spinner-inline'><svg id='spinner-8_12_1_0_0-6' viewBox='0 0 100 100' class='spinner'><circle r='12' cx='88' cy='50' class='circle' style='animation-delay: -0.6s; animation-duration: 0.6s;'></circle><circle r='12' cx='76.87005768508881' cy='76.8700576850888' class='circle' style='animation-delay: -0.525s; animation-duration: 0.6s;'></circle><circle r='12' cx='50' cy='88' class='circle' style='animation-delay: -0.45s; animation-duration: 0.6s;'></circle><circle r='12' cx='23.129942314911197' cy='76.87005768508881' class='circle' style='animation-delay: -0.375s; animation-duration: 0.6s;'></circle><circle r='12' cx='12' cy='50.00000000000001' class='circle' style='animation-delay: -0.3s; animation-duration: 0.6s;'></circle><circle r='12' cx='23.129942314911187' cy='23.129942314911197' class='circle' style='animation-delay: -0.225s; animation-duration: 0.6s;'></circle><circle r='12' cx='49.99999999999999' cy='12' class='circle' style='animation-delay: -0.15s; animation-duration: 0.6s;'></circle><circle r='12' cx='76.8700576850888' cy='23.129942314911187' class='circle' style='animation-delay: -0.075s; animation-duration: 0.6s;'></circle></svg>
</div>`;

  const cnSel = {
    allPages: {
      productListItem: ['.product-list-item:not([data-parsed])', '.goods-item-card:not([data-parsed])'],
      productListItemPriceWrapper: [
        '.product-list-item-price div:first',
        '.goods-item-card__price div:first'
      ],
      productListItemAmount: ['.amount', '.goods-item-card__amount'],
      productListItemBonus: ['.bonus-amount'],
      productListItemBonusPercent: ['.bonus-percent'],
    },
    catalogList: {
      headerCount: ['.catalog-department-header__count'],
      wrapper: [
        '.catalog-listing__items',
        '.cnc-catalog-listing__items',
        '.personal-listing-items__list'],
      item: ['.catalog-item'],
      header: [
        '.catalog-listing-header',
        '.cnc-catalog-listing__sort',
        '.listing-delivery-filters.favorites__delivery-filters',
      ],
      showMoreBtn: [
        '.catalog-listing__show-more',
        '.cnc-catalog-listing__show-more',
        '.personal-listing-items__show-more',
      ],
      showMoreBtnSpinner: [
        '.spinner-inline',
        '.spinner',
      ],
      // sortField: ['.catalog-listing-header .sort-field', '.cnc-catalog-listing__sort-wrapper .sort-field'],
    },
    detailPage: {
      priceCard: ['.offers-info'],
      priceInCardBlock: ['.sales-block-offer-price'],
      priceInCardVal: ['.sales-block-offer-price__price-final'],
      bonusAmount:
          ['.pdp-cashback-table .pdp-cashback-table__row .bonus-amount'],
      // bonusTable: ['.pdp-cashback-table'],
    },
    detailPagePrices: {
      tabSelector: ['.pdp-tab-selector'],
      select: ['.pdp-prices .select'],
      productOffersWrapper: ['.pdp-prices .product-offers'],
      productOffersItems: ['.pdp-prices .product-offer'],
      priceBonusPerRow: ['.product-offer-price .bonus-amount'],
      pricePercentPerRow: ['.product-offer-price .bonus-percent'],
      priceOfferPerRow: ['.product-offer-price .product-offer-price__amount'],
      // productOffersItemsForFind: ['.product-offer'],
    },
    custom: {
      initList: '',
    },
  };

  const apiSel = {
    catalogList: ['/catalog/search'],
  };

  /* ---------- COMMONS FUNCTIONS ---------- */
  const formatterPrice = new Intl.NumberFormat('ru-RU');

  jQuery.fn.extend({
    findInArr: function(clsSelectorArr) {
      let $elem;
      for (let selector of clsSelectorArr) {
        $elem = $(this).find(selector);
        if ($elem.length > 0) {
          break;
        }
      }

      return $elem;
    },
  });

  function $el(clsSelectorArr) {
    let $elem;
    for (let selector of clsSelectorArr) {
      $elem = $(selector);
      if ($elem.length > 0) {
        break;
      }
    }

    return $elem;
  }

  function parseDigitFromElem($elem) {
    $elem = $($elem);

    return Number.parseFloat($elem.text().replace(/\D/g, '')) || 0;
  }

  const getRandomMs = (min = 800, max = 2000) => {
    return Math.random() * (max - min) + min;
  };

  const delay = (ms = getRandomMs()) => new Promise(r => setTimeout(r, ms));

  const waitUntil = (condition, checkInterval = 1000) => {
    return new Promise(resolve => {
      let interval = setInterval(() => {
        if (!condition()) return;
        clearInterval(interval);
        resolve();
      }, checkInterval);
    });
  };

  function isLocationDetailsPage() {
    return location.href.includes('/catalog/details/') ||
        location.href.includes('/promo-page/details/');
  }

  function isLocationCatalogPage() {
    return (location.href.includes('/catalog/')
            || location.href.includes('/personal/favorites/')
            || location.href.includes('/brands/')
            || location.href.includes('/promo-page/'))
        && !location.href.includes('/catalog/details/');
  }

  /* ---------- PAGE CATALOG LIST ---------- */
  // let initSearchReqConf;
  // let initSearchReqResource;
  const {fetch: originalFetch} = window;
  window.fetch = async (...args) => {
    // interceptor loader
    let [resource, config] = args;

    /* Intercept request */
    if (resource.includes('catalogService/catalog/search')
        || resource.includes('customerGoodsListService/item/list')) {
      // let body = JSON.parse(config.body);
      // body.limit = 4;
      // body.offset = 44;
      // config.body = JSON.stringify(body);
    }

    /* Intercept response */
    let initResp = await originalFetch(resource, config);
    const initRespJson = await initResp.clone().json();

    // if (apiSel.catalogList.findIndex(element => element.includes("substring"))) {
    if (resource.includes('/v1/catalogService/catalog/search')
        || resource.includes('customerGoodsListService/item/list')) {
      // initSearchReqConf = !initSearchReqConf ? config : initSearchReqConf;
      // initSearchReqResource = !initSearchReqResource ? resource : initSearchReqResource;

      // const {
      //   items: initItems,
      //   total,
      //   limit,
      //   listingSize,
      //   offset,
      // } = initRespJson;
      // const respJsonArr = [initRespJson];
      // const numbTotal = parseInt(total, 10);
      // const numbLimit = parseInt(limit, 10);
      // const numbOffset = parseInt(offset, 10);
      // const cycleCount = Math.ceil(numbTotal / numbLimit);
      // const actualOffset = numbOffset || numbLimit;
      // for (let index = 1; index < cycleCount - 15; index++) {
      // console.log(index);
      // console.log(actualOffset * index);
      // await delay();
      // newBody.offset = actualOffset * index;
      // config.body = JSON.stringify(newBody);
      // const cycleResp = await originalFetch(resource, config);
      // let cycleRespJson = await cycleResp.clone().json();
      // const { items: secondItems } = secondRespJson;
      // respJsonArr.push(cycleRespJson);
      // }

      // const allItems = respJsonArr.reduce(
      //   (accumulator, currentValue) => accumulator.concat(currentValue.items),
      //   [],
      // );
      // const finalRespJson = respJsonArr[respJsonArr.length - 1];
      // finalRespJson.items = [...allItems];

      window.lastRequestData = args;
      window.lastResponseData = initRespJson;

      return new Response(JSON.stringify(initRespJson));
    }

    return initResp;
  };

  function isLoadingList() {
    // if it has spinner inside show more btn
    return $el(cnSel.catalogList.showMoreBtn).
    findInArr(cnSel.catalogList.showMoreBtnSpinner).length > 0;
  }

  let intervalId;

  function runCheckIsLoadingList() {
    $('.upper-load-btn').addClass('is-loading').prop('disabled', true);

    intervalId = setInterval(function() {
      if (!isLoadingList()) {
        clearInterval(intervalId);
        $('.upper-load-btn').removeClass('is-loading').prop('disabled', false);
      }
    }, 1000);
  }

  function revalidateItemsCounter() {
    $('.custom-total-counter').
    html(
        `<strong>${getCurrentItemsCount()}</strong> 
          из <strong>${getTotalItemsCount()}</strong>`,
    );
  }

  function getCurrentItemsCount() {
    return $el(cnSel.catalogList.wrapper).
    findInArr(cnSel.catalogList.item).length;
  }

  function getTotalItemsCount() {
    if (window.lastResponseData) {
      return window.lastResponseData.total || window.lastResponseData['count'];
    }

    if ($el(cnSel.catalogList.headerCount).length > 0) {
      return parseInt(
          $el(cnSel.catalogList.headerCount).text().replace(/\D/g, ''));
    }

    return 0;
  }

  let catalogListingItemsDefaultArr = [];

  function addFieldsToCardsInList($cards) {
    if (!$cards) {
      let $catalogListingItemsWrapper = $el(cnSel.catalogList.wrapper);
      $cards = $catalogListingItemsWrapper.findInArr(cnSel.catalogList.item);
    }

    $cards.each(function() {
      $card = $(this);
      if ($card.attr('data-parsed') && $card.attr('data-parsed') === '1') {
        return true;
      }
      $card.attr('data-parsed', 1);

      catalogListingItemsDefaultArr.push($card);
      $itemMoney = $card.find('.item-money');
      $itemBonusVal = parseDigitFromElem(
          $itemMoney.find('.item-bonus .bonus-amount'));
      $itemPriceVal = parseDigitFromElem($itemMoney.find('.item-price'));

      $itemMoney.after(`
        <div class='money-benefit'>
          <div class='benefit-item price-for-one'>
            <div class='title'>${$itemPriceVal}-${$itemBonusVal} (бонусы)&nbsp;=&nbsp;</div>
            <div class='val'>${formatterPrice.format(
          $itemPriceVal - $itemBonusVal)} ₽</div>
          </div>
        </div>`);
    });
  }

  /* ---------- PAGE DETAILS ---------- */
  /* Custom sorting in compare lists rows */
  const titleMostProfitDiff = '[Самые выгодные (цена-бонус)]';
  const titleMostBonusPercent = '[Самый большой процент бонуса]';
  const titlePricePrior = '[Приоритет дешевая цена с самым большим бонусом]';

  function addSelectorInDetails() {
    const $pricesSelect = $el(cnSel.detailPagePrices.select);
    $pricesSelect.after('<div class="js-init-check-sort-detail"></div>');
    $pricesSelect.find('input').removeAttr('readonly');

    $pricesSelect.on('click', function() {
      // recalculate extra rows
      addFieldsToRowsInDetail();
      $curSelect = $(this);

      $curSelect.find('.options ul li:first').before(`
        <li class='custom-sort-option-most-profit option'>${titleMostProfitDiff}</li>
        <li class='custom-sort-option-most-bonus option'>${titleMostBonusPercent}</li>
        <!--<li class='custom-sort-option-price-prior option'>${titlePricePrior}</li>-->
      `);

      $curSelect.find('.custom-sort-option-most-profit').
      on('click', function() {
        // hack for set input value
        setTimeout(() => {
          $curSelect.find('input').val(titleMostProfitDiff);
        }, 1000);

        let $productOffersWrapper = $el(
            cnSel.detailPagePrices.productOffersWrapper);
        let $productOffersItems = $el(
            cnSel.detailPagePrices.productOffersItems);

        const sortedByMostProfit = _.orderBy($productOffersItems, function(o) {
          const price = parseDigitFromElem(
              $(o).findInArr(cnSel.detailPagePrices.priceOfferPerRow));
          const bonus = parseDigitFromElem(
              $(o).findInArr(cnSel.detailPagePrices.priceBonusPerRow));
          return price - bonus;
        }, ['asc']);
        $(sortedByMostProfit).appendTo($productOffersWrapper);
      });

      $curSelect.find('.custom-sort-option-most-bonus').on('click', function() {
        // hack for set input value
        setTimeout(() => {
          $curSelect.find('input').val(titleMostBonusPercent);
        }, 1000);

        let $productOffersWrapper = $el(
            cnSel.detailPagePrices.productOffersWrapper);
        let $productOffersItems = $el(
            cnSel.detailPagePrices.productOffersItems);

        const sortedByMostBonus = _.orderBy($productOffersItems, function(o) {
          const bonusPercent = parseDigitFromElem(
              $(o).findInArr(cnSel.detailPagePrices.pricePercentPerRow));

          return bonusPercent;
        }, ['desc']);
        $(sortedByMostBonus).appendTo($productOffersWrapper);
      });

      /* not working I don't know what I need */
      $curSelect.find('.custom-sort-option-price-prior').
      on('click', function() {
        // hack for set input value
        setTimeout(() => {
          $curSelect.find('input').val(titlePricePrior);
        }, 400);

        let $productOffersWrapper = $el(
            cnSel.detailPagePrices.productOffersWrapper);
        let $productOffersItems = $el(
            cnSel.detailPagePrices.productOffersItems);

        let sortedByPricePrior = [];

        sortedByPricePrior = _.orderBy($productOffersItems, function(o) {
          const bonusPercent = parseDigitFromElem(
              $(o).findInArr(cnSel.detailPagePrices.pricePercentPerRow));

          return bonusPercent;
        }, 'desc');

        sortedByPricePrior = _.orderBy(sortedByPricePrior, function(o) {
          const price = parseDigitFromElem(
              $(o).findInArr(cnSel.detailPagePrices.priceOfferPerRow));
          const bonus = parseDigitFromElem(
              $(o).findInArr(cnSel.detailPagePrices.priceBonusPerRow));

          return price - bonus;
        }, 'asc');

        $(sortedByPricePrior).appendTo($productOffersWrapper);
      });
    });
  }

  function addFieldsToRowsInDetail($rows) {
    if (!$rows) {
      $rows = $el(cnSel.detailPagePrices.productOffersItems);
    }

    $rows.each(function() {
      $row = $(this);
      if ($row.attr('data-parsed') && $row.attr('data-parsed') === '1') {
        return true;
      }
      $row.attr('data-parsed', 1);

      $productOfferPrice = $row.find('.product-offer-price');
      $priceAmountEl = $productOfferPrice.find('.product-offer-price__amount');
      $priceAmountVal = parseDigitFromElem($priceAmountEl);
      $bonusAmountVal = parseDigitFromElem(
          $productOfferPrice.find('.money-bonus .bonus-amount'),
      );

      $priceAmountEl.after(`
        <div class='compare-section-price-and-bonus'>
            <div class='title'>${$priceAmountVal}-${$bonusAmountVal} (бонусы)&nbsp;=&nbsp;</div>
            <div class='val'>${formatterPrice.format(
          $priceAmountVal - $bonusAmountVal)} ₽</div>
        </div>
      `);
    });
  }

  async function addPricesSortAndFieldsInDetails() {
    if ($('.js-init-check-sort-detail').length > 0) {
      return false;
    }
    //delay for interface waiting
    await delay(2000);

    const $tabSelector = $el(cnSel.detailPagePrices.tabSelector);
    const isOpenedPrices = $tabSelector.find('a.active').
    text().
    toLowerCase().
    includes('цены');

    // if prices already activated init
    if (isOpenedPrices) {
      await delay(500);
      /* Add sorting logic on price tab */
      addSelectorInDetails();
      /* Add extra info to compare lists rows */
      addFieldsToRowsInDetail();
    }

    // if other tab selected init it later
    $tabSelector.on('click', async function() {
      if ($(this).find('a.active').text().toLowerCase().includes('цены')) {
        await delay(500);

        addSelectorInDetails();
        addFieldsToRowsInDetail();
      }
    });
  }

  /* ---------- INIT BLOCK ---------- */
  function initCatalogList() {
    addFieldsToCardsInList();

    if ($('.js-init-check-list').length > 0) {
      return false;
    }
    $(stylesCatalogList).appendTo('head');

    $el(cnSel.catalogList.header).after(`
      <div class='js-init-check-list'></div>
      <div class='custom-actions-wrapper'>
        <label class='custom-actions-item select-item-wrapper'>
          <span>Сортировка</span>
          <select class='field sm custom-select-sort'>
            <option value='none'>Нет сортировки</option>
            <option value='by-bonus-percent'>По проценту бонуса</option>
            <option value='by-bonus-size'>По размеру бонуса</option>
            <option value='by-final-price'>По значению цена-бонус</option>
          </select>
          <div class='custom-notion'>*Применяется только к результатам на странице</div>
        </label>
        <label class='custom-actions-item input-item-wrapper'>
          <span>Кол. стр для загрузки</span>
          <input class='custom-input-page' type='number' value='1' min='1' max='10' />
        </label>
        <div class='custom-total-counter'></div>
      </div>`);
    $('.custom-input-page').on('change', function() {
      const val = parseInt($(this).val().replace(/\D/g, ''), 10);

      if (val < 1) {
        $(this).val(1);
      }

      if (val > 10) {
        $(this).val(10);
      }
    });
    revalidateItemsCounter();

    const reInitCardsAfterLoad = async function() {
      console.log('reInitCardsAfterLoad');
      await delay(1000);
      addFieldsToCardsInList();
      runCheckIsLoadingList();
    };
    $el(cnSel.catalogList.showMoreBtn).on('click', reInitCardsAfterLoad);

    var $upperBtn = $(
        `<button class='upper-load-btn btn xs'>Загрузить ${spinnerEl}</button>`).
    click(async function() {
      const pageVal = parseInt($('.custom-input-page').val(), 10);
      for (let index = 1; index <= pageVal; index++) {
        // because click not triggering with links
        if ($el(cnSel.catalogList.showMoreBtn).is('a')) {
          $el(cnSel.catalogList.showMoreBtn)[0].click();
        } else {
          $el(cnSel.catalogList.showMoreBtn).trigger('click');
        }

        await waitUntil(() => {
          return !isLoadingList();
        });
        await delay();

        $el(cnSel.catalogList.showMoreBtn).on('click', reInitCardsAfterLoad);
        revalidateItemsCounter();
      }
    });

    $('.custom-actions-wrapper').append($upperBtn);

    $('.custom-select-sort').on('change', function() {
      let $catalogListingItemsWrapper = $el(cnSel.catalogList.wrapper);
      let $catalogListingItems = $catalogListingItemsWrapper.findInArr(
          cnSel.catalogList.item);

      if ($(this).val() === 'none') {
        // console.log(catalogListingItemsDefaultArr);
        // console.log($catalogListingItems);
        $(catalogListingItemsDefaultArr).appendTo($catalogListingItemsWrapper);
      }

      if ($(this).val() === 'by-bonus-percent') {
        $catalogListingItems.sort(function(a, b) {
          const bonusPercentB = parseDigitFromElem(
              $(b).find(`.item-bonus .bonus-percent`));
          const bonusPercentA = parseDigitFromElem(
              $(a).find(`.item-bonus .bonus-percent`));

          return bonusPercentB - bonusPercentA;
        }).appendTo($catalogListingItemsWrapper);
      }

      if ($(this).val() === 'by-bonus-size') {
        $catalogListingItems.sort(function(a, b) {
          const bonusAmountB = parseDigitFromElem(
              $(b).find(`.item-bonus .bonus-amount`));
          const bonusAmountA = parseDigitFromElem(
              $(a).find(`.item-bonus .bonus-amount`));

          return bonusAmountB - bonusAmountA;
        }).appendTo($catalogListingItemsWrapper);
      }

      if ($(this).val() === 'by-final-price') {
        $catalogListingItems.sort(function(a, b) {
          const bonusAmountA = parseDigitFromElem(
              $(a).find(`.item-bonus .bonus-amount`));
          const priceA = parseDigitFromElem($(a).find('.item-price'));

          const bonusAmountB = parseDigitFromElem(
              $(b).find(`.item-bonus .bonus-amount`));
          const priceB = parseDigitFromElem($(b).find('.item-price'));

          return (priceA - bonusAmountA) - (priceB - bonusAmountB);
        }).appendTo($catalogListingItemsWrapper);
      }
    });
  }

  async function initAllProductListItems() {
    // if ($('.js-init-all-items').length > 0) {
    //   return false;
    // }
    $(stylesAllItems).appendTo('head');

    const createAllItems = () => {
      const $allItems = $el(cnSel.allPages.productListItem);

      if ($allItems.length > 0) {
        console.log('initAllProductListItems');

        $allItems.each(function() {
          const $item = $(this);

          if ($item.attr('data-parsed') && $row.attr('data-parsed') === '1') {
            return true;
          }
          $item.attr('data-parsed', 1);

          const price = parseDigitFromElem(
              $item.findInArr(cnSel.allPages.productListItemAmount));
          const bonus = parseDigitFromElem(
              $item.findInArr(cnSel.allPages.productListItemBonus));

          $item.findInArr(cnSel.allPages.productListItemPriceWrapper).before(`
          <div class='js-init-all-items'></div>
          <div class='custom-product-item-price'>
            <div class='title'>${price}-${bonus} (бонусы)&nbsp;=&nbsp;</div>
            <div class='val'>${formatterPrice.format(
              price - bonus)} ₽</div>
          </div>
        `);
        });
      }
    };

    await delay(2000);

    setInterval(createAllItems, 3000);
  }

  function initCatalogDetail() {
    if ($('.js-init-check-detail').length > 0) {
      return false;
    }

    $(stylesDetail).appendTo('head');
    const $priceCard = $el(cnSel.detailPage.priceCard);
    const $priceBlockForInsert = $priceCard.findInArr(
        cnSel.detailPage.priceInCardBlock);
    const $productPriceVal = parseDigitFromElem(
        $priceCard.findInArr(cnSel.detailPage.priceInCardVal));

    /* Init main card price */
    const $bonusAmountSberPayVal = parseDigitFromElem(
        $el(cnSel.detailPage.bonusAmount)[0]);
    const bonusAmountOtherVal = parseDigitFromElem(
        $el(cnSel.detailPage.bonusAmount)[1]);

    $priceBlockForInsert.after(`
      <div class='price-and-bonus'>
          <div class='js-init-check-detail'></div>
          <div class='price-item'>
              <div class='title'>${$productPriceVal}-${$bonusAmountSberPayVal} (за сберпей)&nbsp;=&nbsp;</div>
              <div class='val'>${formatterPrice.format(
        $productPriceVal - $bonusAmountSberPayVal)} ₽</div>
          </div>
          <div class='price-item'>
              <div class='title'>${$productPriceVal}-${bonusAmountOtherVal} (др. способ опл.)&nbsp;=&nbsp;</div>
              <div class='val'>${formatterPrice.format(
        $productPriceVal - bonusAmountOtherVal)} ₽</div>
          </div>
      </div>`,
    );

    addPricesSortAndFieldsInDetails();
  }

  const fireEventsAndEntry = () => {
    console.log('fireEventsAndEntry');
    initAllProductListItems();

    if (isLocationDetailsPage()) {
      console.log('initCatalogDetail');
      setTimeout(initCatalogDetail, 2500);
    }

    if (isLocationCatalogPage()) {
      console.log('initCatalogList');
      setTimeout(initCatalogList, 2500);
    }
  };

  let pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    fireEventsAndEntry();
  };

  let replaceState = history.replaceState;
  history.replaceState = function() {
    replaceState.apply(history, arguments);
    fireEventsAndEntry();
  };

  $(window).bind('popstate', function() {
    fireEventsAndEntry();
  });

  // $(function() {
  //   fireEventsAndEntry();
  // });
})();
