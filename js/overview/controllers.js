/*global angular, _eventPage, _i18n, _storage, purl*/

/*
 * This file is part of Super Simple Highlighter.
 * 
 * Super Simple Highlighter is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Super Simple Highlighter is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

// disable console log
// console.log = function() {}

/**
 * Controllers module
 * @type {ng.IModule}
 */
var overviewControllers = angular.module('overviewControllers', []);


// array this is something to do with minification
overviewControllers.controller('DocumentsController', ["$scope", function ($scope) {
    'use strict';
	var backgroundPage;
	
    $scope.manifest = chrome.runtime.getManifest();

    /**
     * Initializer, called from the starter section
     * @param {number} [tabId] tab id of the tab associated with the popup that navigated here, or NaN if not known or specified
     * @param {string} url tab url
     * @param {string} [title] optional tab title
     * @param {object} bgPage
	 * @param {string} sortby
	 * @param {boolean} invert
     */
    function onInit(tabId, url, title, bgPage, sortby, invert){
		$scope.tabId = tabId;
		$scope.url = url;

		// share title with that of the source page
		$scope.title = title;
		$scope.sortby = sortby;
		// document.title = chrome.i18n.getMessage("overview_document_title", [title]);

		// used to scroll tab's page to the clicked highlight
		backgroundPage = bgPage;

        // get all the documents (create & delete) associated with the match, then filter the deleted ones
		const match = backgroundPage._database.buildMatchString(url);
		const comparator = backgroundPage._tabs.getComparisonFunction(tabId, sortby)

        return backgroundPage._database.getCreateDocuments_Promise(match).then(function (docs) {
			// main promise (default to native order)
			return (comparator && backgroundPage._database.sortDocuments(docs, comparator)) 
				|| Promise.resolve(docs);
		}).then(function (docs) {
			if (invert) {
				docs.reverse()
			}
			
			// group by days since epoch
			var groupedDocs = []

			docs.forEach((doc) => {
				var date = new Date(doc.date)
				var daysSinceEpoch = Math.floor(date.getTime() / 8.64e7)

				// first, or different days since epoch of last group
				if (groupedDocs.length === 0 || daysSinceEpoch !== groupedDocs[groupedDocs.length-1].daysSinceEpoch) {
					// each group defines its days since epoch and an ordered array of docs
					groupedDocs.push({
						daysSinceEpoch: daysSinceEpoch,
						representativeDate: date,
						docs: []
					})
				}

				groupedDocs[groupedDocs.length-1].docs.push(doc)
			})
			
			$scope.groupedDocs = groupedDocs
            $scope.docs = docs;
			
			// we form the plural string in the controller instead of the view, because ngPluralize can't refer to i18n things
			var length = docs.length;
			var messageName;
			
			if (length == 0) {
				messageName = "plural_zero_highlights";
			} else if (length == 1) {
				messageName = "plural_one_highlight";
			} else {
				messageName = "plural_other_highlights";
			}
			
			$scope.docsCount = chrome.i18n.getMessage(messageName, [docs.length]);
            $scope.$apply();

            // if the highlight cant be found in DOM, flag that
            if (!isNaN(tabId)) {
                docs.forEach(function (doc) {
                    // default to undefined, implying it IS in the DOM
                    backgroundPage._eventPage.isHighlightInDOM(tabId, doc._id).then(function (isInDOM) {
                        doc.isInDOM = isInDOM;

                        $scope.$apply();
                    });
                });
            }
        });
    }

	/**
	 * Clicked the header, showing the source page title.
     * Makes corresponding tab active
	 * @type function
	 */
	// $scope.onClickPageUrl = function () {
	// 	// make the tab which was associated with the popup that launched us the active tab.
	// 	// If it has been closed nothing will happen (but the user can open explicitly from the anchor instead)
	// 	chrome.tabs.update($scope.tabId, {
	// 		active: true
	// 	});
	// }

	/**
	 * Clicked a highlight. Make the associated tab active, and scroll it to its position
	 * @param {Object} doc highlight document which was clicked
	 */	
	$scope.onClickHighlight = function(doc) {
		// if scrolling to the element is successful, only then we can make the tab active
        return backgroundPage._eventPage.scrollTo($scope.tabId, doc._id).then(function(didScroll) {
        	if (didScroll) {
				// make it the active tab
				chrome.tabs.update($scope.tabId, {
					active: true
				});
        	}
        });
		
	}




	/**
	 * Starter 
	 * parse href (supplied by popup's controller) to find url, which is used to find match string
	 */
    var u = purl(location.href),
		id = u.param('id'), 
		url = u.param('url'),
		title = u.param('title'),
		sortby = u.param('sortby'),
		invert = Boolean(u.param('invert'));

    if (url !== undefined) {
        chrome.runtime.getBackgroundPage(function (backgroundPage) {
            onInit(parseInt(id), url, title, backgroundPage, sortby, invert);
        });
    }



//    chrome.tabs.query({ active: true, currentWindow: true }, function (result) {
//        chrome.runtime.getBackgroundPage(function (backgroundPage) {
//            onInit(result[0], backgroundPage);
//        });
//    });

}]);