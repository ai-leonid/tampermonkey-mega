// ==UserScript==
// @name         Megamarket extra fields and sorts
// @namespace    http://tampermonkey.net/
// @version      1.1.2
// @description  Сортировка на странице по баллам и цены товаров с учётом баллов.
// @author       ai-leonid
// @match        *://megamarket.ru/*
// @icon         *://www.google.com/s2/favicons?sz=64&domain=megamarket.ru
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// ==/UserScript==

(function() {
  // const nativeFetch = window.fetch;
  // window.fetch = function(...args) {
  //   let [resource, config] = args;
  //
  //   if (resource.includes('/v1/catalogService/catalog/search')) {
  //     let body = JSON.parse(config.body);
  //     body.limit = 5;
  //     config.body = JSON.stringify(body);
  //   }
  //   return nativeFetch.apply(window, args);
  // };

  const getRandomMs = (min = 800, max = 2000) => {
    return Math.random() * (max - min) + min;
  };

  const delay = (ms = getRandomMs()) => new Promise(r => setTimeout(r, ms));


  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    let [resource, config] = args;

    /* Intercept request */
    if (resource.includes('/v1/catalogService/catalog/search')) {
      let body = JSON.parse(config.body);
      // body.limit = 44;
      // body.offset = 44;
      config.body = JSON.stringify(body);
    }

    /* Intercept response */
    let initResp = await originalFetch(resource, config);

    if (resource.includes('/v1/catalogService/catalog/search')) {
      const initRespJson = await initResp.clone().json();
      const {
        items: initItems,
        total,
        limit,
        listingSize,
        offset,
      } = initRespJson;
      const numbTotal = parseInt(total);
      const numbLimit = parseInt(limit);
      const numbOffset = parseInt(offset);

      const respJsonArr = [initRespJson];

      // const getDataSeries = async items => {
      //   let results = [];
      //   for (let index = 0; index < items.length; index++) {
      //     await delay();
      //     const res = await fetch(items[index]);
      //     results.push({ name: res.name, data: res.data });
      //   }
      //   return results;
      // };

      console.log('----------config.body');
      let newBody = JSON.parse(config.body);
      console.log(newBody);
      // newBody.offset = offset * 2;
      config.body = JSON.stringify(newBody);

      console.log('----------cycleCount HERE D1A3DE86B6737F4B');
      const cycleCount = Math.ceil(numbTotal / numbLimit);
      console.log(cycleCount);
      console.log(numbTotal);
      const actualOffset = numbOffset || numbLimit;

      for (let index = 1; index < cycleCount-15; index++) {
        // console.log(index);
        // console.log(actualOffset * index);
        // await delay();
        // newBody.offset = actualOffset * index;
        // config.body = JSON.stringify(newBody);
        // const cycleResp = await originalFetch(resource, config);
        // let cycleRespJson = await cycleResp.clone().json();
        // const { items: secondItems } = secondRespJson;

        // respJsonArr.push(cycleRespJson);
      }

      const allItems = respJsonArr.reduce(
        (accumulator, currentValue) => accumulator.concat(currentValue.items),
        [],
      );

      console.log('----allItems');
      console.log(allItems);

      const finalRespJson = respJsonArr[respJsonArr.length - 1];

      finalRespJson.items = [...allItems];

      console.log('----finalRespJson');
      console.log(finalRespJson);
      return new Response(JSON.stringify(finalRespJson));
    }

    return initResp;
  };
})();

(function() {
  const stylesCatalogList = `
  <style>
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
    
    .sort-notion {
      position: absolute;
      bottom: -13px;
      left: 0;
      font-size: 9px;
      opacity: 0.7;
      width: 120%;
    }
    
    .custom-select-wrapper {
      position: relative;
      max-width: 300px;
      width: 100%;
    }
    
    .custom-select-sort {
      background-color: var(--pui-bg-layer-01, );
      border: 1px solid var(--pui-border-primary, );
      border-radius: 8px;
      box-sizing: border-box;
      color: var(--pui-text-primary, );
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
    
    .catalog-listing__items .catalog-item .item-price {
      opacity: 0.6;
    }
  </style>`;
  const stylesDetail = `
  <style>
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
    
    .pdp-prices .product-offer-price__amount {
      opacity: 0.6;
    }
    
    .offers-info .sales-block-offer-price__price-final {
      opacity: 0.6;
    }
  </style>`;
  const formatterPrice = new Intl.NumberFormat('ru-RU');

  function parseDigitFromElem($elem) {
    return Number.parseFloat($elem.text().replace(/\D/g, '')) || 0;
  }

  let catalogListingItemsDefaultArr = [];

  function addExtraFieldsToCardsInList($cards) {
    $cards.each(function() {
      $card = $(this);
      // console.log(typeof $card.attr('data-parsed'));
      // console.log($card.attr('data-parsed'));
      // if ($card.attr('data-parsed') && $card.attr('data-parsed') === '1') {
      //     return true;
      // }
      // $card.attr('data-parsed', 1);

      catalogListingItemsDefaultArr.push($card);

      $itemMoney = $card.find('.item-money');
      $itemBonusVal = parseDigitFromElem($itemMoney.find('.item-bonus .bonus-amount'));
      $itemPriceVal = parseDigitFromElem($itemMoney.find('.item-price'));

      $itemMoney.after(`
        <div class='money-benefit'>
          <div class='benefit-item price-for-one'>
            <div class='title'>${$itemPriceVal}-${$itemBonusVal} (бонусы)&nbsp;=&nbsp;</div>
            <div class='val'>${formatterPrice.format($itemPriceVal - $itemBonusVal)} ₽</div>
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
            <div class='val'>${formatterPrice.format($priceAmountVal - $bonusAmountVal)} ₽</div>
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

      $curSelect.find('.custom-sort-option-most-profit').on('click', function() {
        // hack for set input value
        setTimeout(() => {
          $curSelect.find('input').val(titleMostProfitDiff);
        }, 1000);

        let $productOffersWrapper = $('.pdp-prices .product-offers');
        let $productOffersItems = $productOffersWrapper.find('.product-offer');

        const sortedByMostProfit = _.orderBy($productOffersItems, function(o) {
          const price = parseDigitFromElem($(o)
          .find(`.product-offer-price .product-offer-price__amount`));
          const bonus = parseDigitFromElem($(o)
          .find('.product-offer-price .money-bonus .bonus-amount'));
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
          const bonusPercent = parseDigitFromElem($(o)
          .find('.product-offer-price .money-bonus .bonus-percent'));

          return bonusPercent;
        }, ['desc']);
        $(sortedByMostBonus).appendTo($productOffersWrapper);
      });

      /* not working I don't know what I need */
      $curSelect.find('.custom-sort-option-price-prior').on('click', function() {
        // hack for set input value
        setTimeout(() => {
          $curSelect.find('input').val(titlePricePrior);
        }, 400);

        let $productOffersWrapper = $('.pdp-prices .product-offers');
        let $productOffersItems = $productOffersWrapper.find('.product-offer');

        let sortedByPricePrior = [];

        sortedByPricePrior = _.orderBy($productOffersItems, function(o) {
          const bonusPercent = parseDigitFromElem($(o)
          .find('.product-offer-price .money-bonus .bonus-percent'));

          return bonusPercent;
        }, 'desc');

        sortedByPricePrior = _.orderBy(sortedByPricePrior, function(o) {
          const price = parseDigitFromElem($(o)
          .find(`.product-offer-price .product-offer-price__amount`));
          const bonus = parseDigitFromElem($(o)
          .find('.product-offer-price .money-bonus .bonus-amount'));

          return price - bonus;
        }, 'asc');

        $(sortedByPricePrior).appendTo($productOffersWrapper);
      });
    });

    /* Add extra info to compare lists rows */
    addExtraFieldsToRowsInDetail($('.pdp-prices .product-offer'));
  }

  function initCatalogList() {
    let $catalogListingItemsWrapper = $('.catalog-listing__items');
    if ($catalogListingItemsWrapper.length === 0) {
      $catalogListingItemsWrapper = $('.cnc-catalog-listing__items');
    }
    let $catalogListingItems = $catalogListingItemsWrapper.find('.catalog-item');
    addExtraFieldsToCardsInList($catalogListingItems);

    if ($('.js-init-check-list').length > 0) {
      return false;
    }

    $(stylesCatalogList).appendTo('head');
    let $sortField = $('.catalog-listing-header .sort-field');
    if ($catalogListingItemsWrapper.length === 0) {
      $sortField = $('.cnc-catalog-listing__sort-wrapper .sort-field');
    }
    let $showMoreBtn = $(`.catalog-listing__show-more`);
    if ($showMoreBtn.length === 0) {
      $showMoreBtn = $('.cnc-catalog-listing__show-more');
    }

    // setTimeout(()=>{
    //   $showMoreBtn
    // }, 1000)

    $sortField.after(`
      <div class='js-init-check-list'></div>
      <div class='custom-select-wrapper'>
        <div class='sort-notion'>*Сортировка применяется к результатам, которые уже есть на странице</div>
          <select class='field sm custom-select-sort'>
            <option value='none'>Нет сортировки</option>
            <option value='by-bonus-percent'>По проценту бонуса</option>
            <option value='by-bonus-size'>По размеру бонуса</option>
            <option value='by-final-price'>По значению цена-бонус</option>
          </select>
      </div>`);

    const reInitClick = function() {
      setTimeout(function() {
        $catalogListingItemsWrapper = $('.catalog-listing__items');
        $catalogListingItems = $catalogListingItemsWrapper.find('.catalog-item');
        addExtraFieldsToCardsInList($catalogListingItems);

        $(`.catalog-listing__show-more`).on('click', reInitClick);
      }, 2000);
    };

    $showMoreBtn.on('click', reInitClick);

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
          const bonusPercentB = parseDigitFromElem($(b)
          .find(`.item-bonus .bonus-percent`));
          const bonusPercentA = parseDigitFromElem($(a)
          .find(`.item-bonus .bonus-percent`));

          return bonusPercentB - bonusPercentA;
        }).appendTo($catalogListingItemsWrapper);
      }

      if ($(this).val() === 'by-bonus-size') {
        $catalogListingItems.sort(function(a, b) {
          const bonusAmountB = parseDigitFromElem($(b)
          .find(`.item-bonus .bonus-amount`));
          const bonusAmountA = parseDigitFromElem($(a)
          .find(`.item-bonus .bonus-amount`));

          return bonusAmountB - bonusAmountA;
        }).appendTo($catalogListingItemsWrapper);
      }

      if ($(this).val() === 'by-final-price') {
        $catalogListingItems.sort(function(a, b) {
          const bonusAmountA = parseDigitFromElem($(a)
          .find(`.item-bonus .bonus-amount`));
          const priceA = parseDigitFromElem($(a).find('.item-price'));

          const bonusAmountB = parseDigitFromElem($(b)
          .find(`.item-bonus .bonus-amount`));
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
    const $productPriceVal = parseDigitFromElem($priceCard.find('.sales-block-offer-price__price-final'));

    /* Init main card price */
    const $bonusAmountSberPayVal = parseDigitFromElem(
      $($bonusTable.find('.pdp-cashback-table__row')[0]).find('.bonus-amount'),
    );
    const bonusAmountOtherVal = parseDigitFromElem(
      $($bonusTable.find('.pdp-cashback-table__row')[1]).find('.bonus-amount'),
    );

    $priceBlockForInsert.after(`
      <div class='price-and-bonus'>
          <div class='js-init-check-detail'></div>
          <div class='price-item'>
              <div class='title'>${$productPriceVal}-${$bonusAmountSberPayVal} (за сберпей)&nbsp;=&nbsp;</div>
              <div class='val'>${formatterPrice.format($productPriceVal - $bonusAmountSberPayVal)} ₽</div>
          </div>
          <div class='price-item'>
              <div class='title'>${$productPriceVal}-${bonusAmountOtherVal} (др. способ опл.)&nbsp;=&nbsp;</div>
              <div class='val'>${formatterPrice.format($productPriceVal - bonusAmountOtherVal)} ₽</div>
          </div>
      </div>`,
    );
  }

  const fireEventsAndEntry = () => {
    console.log('fireEventsAndEntry');
    if (location.href.includes('/catalog/details/') || location.href.includes('/promo-page/details/')) {
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

    if (location.href.includes('/catalog/details/') && location.href.includes('details_block=prices')) {
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
