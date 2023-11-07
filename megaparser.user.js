// ==UserScript==
// @name         Megamarket extra fields and sorts
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  Сортировка на странице по баллам и цены товаров с учётом баллов.
// @author       ai-leonid
// @match        *://megamarket.ru/*
// @icon         *://www.google.com/s2/favicons?sz=64&domain=megamarket.ru
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// ==/UserScript==

(function() {
  const stylesCatalogList = `
  <style>
    /* CUSTOM RULES REPAIR */
    .catalog-listing__items .catalog-item .item-price {
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
  const formatterPrice = new Intl.NumberFormat('ru-RU');

  const spinnerEl = `
  <div class='spinner-inline'><svg id='spinner-8_12_1_0_0-6' viewBox='0 0 100 100' class='spinner'><circle r='12' cx='88' cy='50' class='circle' style='animation-delay: -0.6s; animation-duration: 0.6s;'></circle><circle r='12' cx='76.87005768508881' cy='76.8700576850888' class='circle' style='animation-delay: -0.525s; animation-duration: 0.6s;'></circle><circle r='12' cx='50' cy='88' class='circle' style='animation-delay: -0.45s; animation-duration: 0.6s;'></circle><circle r='12' cx='23.129942314911197' cy='76.87005768508881' class='circle' style='animation-delay: -0.375s; animation-duration: 0.6s;'></circle><circle r='12' cx='12' cy='50.00000000000001' class='circle' style='animation-delay: -0.3s; animation-duration: 0.6s;'></circle><circle r='12' cx='23.129942314911187' cy='23.129942314911197' class='circle' style='animation-delay: -0.225s; animation-duration: 0.6s;'></circle><circle r='12' cx='49.99999999999999' cy='12' class='circle' style='animation-delay: -0.15s; animation-duration: 0.6s;'></circle><circle r='12' cx='76.8700576850888' cy='23.129942314911187' class='circle' style='animation-delay: -0.075s; animation-duration: 0.6s;'></circle></svg>
</div>`;

  const cnSel = {
    catalogList: {
      headerCount: ['.catalog-department-header__count'],
      wrapper: ['.catalog-listing__items', '.cnc-catalog-listing__items'],
      item: ['.catalog-item'],
      header: ['.catalog-listing-header', '.cnc-catalog-listing__sort'],
      showMoreBtn: [
        '.catalog-listing__show-more',
        '.cnc-catalog-listing__show-more'],
      // sortField: ['.catalog-listing-header .sort-field', '.cnc-catalog-listing__sort-wrapper .sort-field'],
    },
    rowInListDetail: [],
    detailPagePrice: [],
    custom: {
      initList: '',
    },
  };

  const urlSel = {
    catalogList: ['/v1/catalogService/catalog/search'],
  };

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
    return Number.parseFloat($elem.text().replace(/\D/g, '')) || 0;
  }

  /* INTERCEPTOR LOADER*/
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

  // let initSearchReqConf;
  // let initSearchReqResource;
  const {fetch: originalFetch} = window;
  window.fetch = async (...args) => {
    let [resource, config] = args;

    /* Intercept request */
    if (resource.includes('/v1/catalogService/catalog/search')) {
      // let body = JSON.parse(config.body);
      // body.limit = 4;
      // body.offset = 44;
      // config.body = JSON.stringify(body);
    }

    /* Intercept response */
    let initResp = await originalFetch(resource, config);
    if (resource.includes('/v1/catalogService/catalog/search')) {
      const initRespJson = await initResp.clone().json();

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

  let intervalId;

  function isLoadingList() {
    // if it has spinner inside show more btn
    return $el(cnSel.catalogList.showMoreBtn).find('.spinner-inline').length >
        0;
  }

  function runCheckIsLoadingList() {
    $('.upper-load-btn').addClass('is-loading').prop('disabled', true);

    intervalId = setInterval(function() {
      if (!isLoadingList()) {
        clearInterval(intervalId);
        $('.upper-load-btn').removeClass('is-loading').prop('disabled', false);
      }
    }, 1000);
  }

  function getCurrentItemsCount() {
    return $el(cnSel.catalogList.wrapper).
    findInArr(cnSel.catalogList.item).length;
  }

  function getTotalItemsCount() {

    if (window.lastResponseData) {
      return window.lastResponseData.total;
    }

    if ($el(cnSel.catalogList.headerCount).length > 0) {
      return parseInt(
          $el(cnSel.catalogList.headerCount).text().replace(/\D/g, ''));
    }

    return 0;
  }

  let catalogListingItemsDefaultArr = [];

  function addExtraFieldsToCardsInList($cards) {
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

  function addExtraFieldsToRowsInDetail($rows) {
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

  /* Custom sorting in compare lists rows */
  function initCompareSortInDetail() {
    if ($('.js-init-check-sort-detail').length > 0) {
      return false;
    }

    const $pricesSelect = $('.pdp-prices .select');
    $pricesSelect.after('<div class="js-init-check-sort-detail"></div>');
    $pricesSelect.find('input').removeAttr('readonly');

    const titleMostProfitDiff = '[Самые выгодные (цена-бонус)]';
    const titleMostBonusPercent = '[Самый большой процент бонуса]';
    const titlePricePrior = '[Приоритет дешевая цена с самым большим бонусом]';
    $pricesSelect.on('click', function() {
      // recalculate extra rows
      addExtraFieldsToRowsInDetail($('.pdp-prices .product-offer'));
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

        let $productOffersWrapper = $('.pdp-prices .product-offers');
        let $productOffersItems = $productOffersWrapper.find('.product-offer');

        const sortedByMostProfit = _.orderBy($productOffersItems, function(o) {
          const price = parseDigitFromElem(
              $(o).find(`.product-offer-price .product-offer-price__amount`));
          const bonus = parseDigitFromElem(
              $(o).find('.product-offer-price .money-bonus .bonus-amount'));
          return price - bonus;
        }, ['asc']);
        $(sortedByMostProfit).appendTo($productOffersWrapper);
      });

      $curSelect.find('.custom-sort-option-most-bonus').on('click', function() {
        // hack for set input value
        setTimeout(() => {
          $curSelect.find('input').val(titleMostBonusPercent);
        }, 1000);

        let $productOffersWrapper = $('.pdp-prices .product-offers');
        let $productOffersItems = $productOffersWrapper.find('.product-offer');

        const sortedByMostBonus = _.orderBy($productOffersItems, function(o) {
          const bonusPercent = parseDigitFromElem(
              $(o).find('.product-offer-price .money-bonus .bonus-percent'));

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

        let $productOffersWrapper = $('.pdp-prices .product-offers');
        let $productOffersItems = $productOffersWrapper.find('.product-offer');

        let sortedByPricePrior = [];

        sortedByPricePrior = _.orderBy($productOffersItems, function(o) {
          const bonusPercent = parseDigitFromElem(
              $(o).find('.product-offer-price .money-bonus .bonus-percent'));

          return bonusPercent;
        }, 'desc');

        sortedByPricePrior = _.orderBy(sortedByPricePrior, function(o) {
          const price = parseDigitFromElem(
              $(o).find(`.product-offer-price .product-offer-price__amount`));
          const bonus = parseDigitFromElem(
              $(o).find('.product-offer-price .money-bonus .bonus-amount'));

          return price - bonus;
        }, 'asc');

        $(sortedByPricePrior).appendTo($productOffersWrapper);
      });
    });

    /* Add extra info to compare lists rows */
    addExtraFieldsToRowsInDetail($('.pdp-prices .product-offer'));
  }

  function initCatalogList() {
    addExtraFieldsToCardsInList();

    if ($('.js-init-check-list').length > 0) {
      return false;
    }
    $(stylesCatalogList).appendTo('head');

    let $catalogListHeader = $el(cnSel.catalogList.header);
    $catalogListHeader.after(`
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
          <input class='custom-input-page' type='number' value='1' min='1' max='5' />
        </label>
        <div class='custom-total-counter'></div>
      </div>`);
    $('.custom-input-page').on('change', function() {
      const val = parseInt($(this).val().replace(/\D/g, ''), 10);

      if (val < 1) {
        $(this).val(1);
      }

      if (val > 5) {
        $(this).val(5);
      }
    });
    $('.custom-total-counter').
    html(
        `<strong>${getCurrentItemsCount()}</strong> из <strong>${getTotalItemsCount()}</strong>`);

    const reInitCardsAfterLoad = function() {
      console.log('reInitCardsAfterLoad');
      addExtraFieldsToCardsInList();
      runCheckIsLoadingList();
    };
    $el(cnSel.catalogList.showMoreBtn).on('click', reInitCardsAfterLoad);

    var $upperBtn = $(
        `<button class='upper-load-btn btn xs'>Загрузить ${spinnerEl}</button>`).
    click(async function() {
      const pageVal = parseInt($('.custom-input-page').val(), 10);

      for (let index = 1; index <= pageVal; index++) {
        $el(cnSel.catalogList.showMoreBtn).trigger('click');

        await waitUntil(() => {
          return !isLoadingList();
        });

        $el(cnSel.catalogList.showMoreBtn).on('click', reInitCardsAfterLoad);
        $('.custom-total-counter').
        html(
            `<strong>${getCurrentItemsCount()}</strong> из <strong>${getTotalItemsCount()}</strong>`);

        await delay();
      }
    });

    $('.custom-actions-wrapper').append($upperBtn);

    $('.custom-select-sort').on('change', function() {
      $catalogListingItemsWrapper = $('.catalog-listing__items');
      $catalogListingItems = $catalogListingItemsWrapper.find('.catalog-item');

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

  function initCatalogDetail() {
    if ($('.js-init-check-detail').length > 0) {
      return false;
    }

    $(stylesDetail).appendTo('head');
    const $priceCard = $('.offers-info');
    const $priceBlockForInsert = $priceCard.find('.sales-block-offer-price');
    const $bonusTable = $priceCard.find('.pdp-cashback-table');
    //есть ещё такая страница https://megamarket.ru/promo-page/details/#?slug=naushniki-a4tech-bloody-mr710-s-mikrofonom-chernye-bt-100047538775&merchantId=11440
    //там другой класс вместо pdp-sales-block__price-final -> sales-block-offer-price__price-final
    const $productPriceVal = parseDigitFromElem($priceCard.find(
        '.sales-block-offer-price__price-final'));

    /* Init main card price */
    const $bonusAmountSberPayVal = parseDigitFromElem(
        $($bonusTable.find('.pdp-cashback-table__row')[0]).
        find('.bonus-amount'),
    );
    const bonusAmountOtherVal = parseDigitFromElem(
        $($bonusTable.find('.pdp-cashback-table__row')[1]).
        find('.bonus-amount'),
    );

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
  }

  const fireEventsAndEntry = () => {
    console.log('fireEventsAndEntry');
    if (location.href.includes('/catalog/details/') ||
        location.href.includes('/promo-page/details/')) {
      console.log('initCatalogDetail');
      setTimeout(initCatalogDetail, 2000);
    }

    // есть ещё https://megamarket.ru/shop/citilink/catalog/naushniki-i-aksessuary
    if ((location.href.includes('/catalog/')
            || location.href.includes('/brands/')
            || location.href.includes('/promo-page/'))
        && !location.href.includes('/catalog/details/')) {
      console.log('initCatalogList');
      setTimeout(initCatalogList, 2000);
    }

    if (location.href.includes('/catalog/details/') &&
        location.href.includes('details_block=prices')) {
      console.log('initCompareSortInDetail');
      setTimeout(initCompareSortInDetail, 500);
    }
  };

  let pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    fireEventsAndEntry('pushState', arguments);
  };

  $(window).bind('popstate', function() {
    fireEventsAndEntry();
  });

  $(function() {
    // setTimeout(fireEventsAndEntry, 5000);
    fireEventsAndEntry();
  });
})();
