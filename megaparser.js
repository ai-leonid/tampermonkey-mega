// ==UserScript==
// @name         Мегамаркет парсер цены
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  try to take over the world!
// @author       You
// @match        https://megamarket.ru/catalog*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=megamarket.ru
// @grant        none
// @require  https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

(function() {

  const styles = `<style>
                .money-benefit { 
                    display: flex;
                    padding-top: 3px;
                    padding-bottom: 3px;
                    padding-left: 3px;
                    padding-right: 3px;
                    border: 1px solid #8654cc;
                    border-radius: 5px;
                    margin-bottom: 15px;
                 }
                 
                 .money-benefit .benefit-item { 
                    display: flex;
                    justify-content: right;
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
                </style>`

  const formatter = new Intl.NumberFormat('ru-RU');

  function parseDigitFromElem($elem) {
    return Number.parseFloat($elem.text().replace(/\D/g, '')) || 0;
  }

  let catalogListingItemsDefaultArr = [];

  function addExtraFieldsToCards($cards) {
    $cards.each(function() {
      $card = $(this);
      // console.log(typeof $card.attr('data-parsed'));
      // console.log($card.attr('data-parsed'));
      // if ($card.attr('data-parsed') && $card.attr('data-parsed') === '1') {
      //     return true;
      // }
      $card.attr('data-parsed', 1);

      catalogListingItemsDefaultArr.push($card)

      $itemMoney = $card.find('.item-money');
      $itemBonusVal = parseDigitFromElem($itemMoney.find('.item-bonus .bonus-amount'));
      $itemPriceVal = parseDigitFromElem($itemMoney.find('.item-price span'));

      $itemMoney.after( `<div class="money-benefit">
                <div class="benefit-item price-for-one">
                    <div class="title">Цена-Бонусы=&nbsp;</div>
                    <div class="val">${formatter.format($itemPriceVal - $itemBonusVal)} ₽</div>
                </div>
            </div>` );

    });
  }

  function initLoad($cards) {
    addExtraFieldsToCards($cards);
  }

  $(function() {
    setTimeout(function(){
      $(styles).appendTo('head')
      const $catalogListingHeader = $('.catalog-listing-header');
      const $sortField = $catalogListingHeader.find('.sort-field');
      const $showMoreBtn = $(`.catalog-listing__show-more`);
      let $catalogListingItemsWrapper = $('.catalog-listing__items');
      let $catalogListingItems = $catalogListingItemsWrapper.find('.catalog-item');

      initLoad($catalogListingItems);

      $sortField.after(`<div class="custom-select-wrapper">
                    <div class="sort-notion">*Сортировка применяется к результатам, которые уже есть на странице</div>
                        <select class="field sm custom-select-sort">
                            <option value="none">Нет сортировки</option>
                            <option value="by-bonus-percent">По проценту бонуса</option>
                            <option value="by-bonus-size">По размеру бонуса</option>
                            <option value="by-final-price">По значению цена-бонус</option>
                        </select>
                </div>
            `)

      const reInitClick = function () {
        setTimeout(function(){
          $catalogListingItemsWrapper = $('.catalog-listing__items')
          $catalogListingItems = $catalogListingItemsWrapper.find('.catalog-item')
          addExtraFieldsToCards($catalogListingItems);

          $(`.catalog-listing__show-more`).on('click', reInitClick);
        }, 5000)
      }

      $showMoreBtn.on('click', reInitClick);

      $('.custom-select-sort').on('change', function() {
        $catalogListingItemsWrapper = $('.catalog-listing__items');
        $catalogListingItems = $catalogListingItemsWrapper.find('.catalog-item');

        if ($(this).val() === 'none') {
          console.log(catalogListingItemsDefaultArr);
          console.log($catalogListingItems);
          $(catalogListingItemsDefaultArr).appendTo($catalogListingItemsWrapper)
        }

        if ($(this).val() === 'by-bonus-percent') {
          $catalogListingItems.sort(function(a, b) {
            const bonusPercentB = parseDigitFromElem($(b)
            .find(`.item-bonus .bonus-percent`))
            const bonusPercentA = parseDigitFromElem($(a)
            .find(`.item-bonus .bonus-percent`))

            return bonusPercentB - bonusPercentA;
          }).appendTo($catalogListingItemsWrapper);
        }

        if ($(this).val() === 'by-bonus-size') {
          $catalogListingItems.sort(function(a, b) {
            const bonusAmountB = parseDigitFromElem($(b)
            .find(`.item-bonus .bonus-amount`))
            const bonusAmountA = parseDigitFromElem($(a)
            .find(`.item-bonus .bonus-amount`))

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
      })
    }, 5000)

  });
})();
