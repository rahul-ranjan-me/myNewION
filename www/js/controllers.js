angular.module('aes.controllers', ['ionic', 'ngCordova', 'aes.services', 'ui.calendar', 'ui.bootstrap', 'ionic-datepicker'])

.controller('rootController', function(DB, $ionicLoading, $state, $ionicPlatform, 
        AffiliationService, AffiliationDTO){
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
	$ionicPlatform.ready(function() {
		DB.init().then(function(data) {
            console.log("DB initialized");
			AffiliationService.getStored().then(function(data) {
				if(!data) {
					$state.go('nonAffiliated');
				} else {
                    AffiliationDTO.setAffiliationData(data);
					$state.go('affiliated');
				}
				$ionicLoading.hide();
			}, function(error){
                console.error(error);
                $ionicLoading.hide();
            });
            
		}, function(error){
            console.error(error);
            $ionicLoading.hide();
        });
	});
})

.controller('affiliationController', function($scope, $state, $ionicLoading, 
        $ionicHistory, $ionicPopup, AffiliationService, AffiliationDTO) {
    $ionicHistory.clearHistory();
    $scope.error = null;
    $scope.affiliationNumber = null;
    $scope.saveAffiliation = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        AffiliationService.fetchRemote(this.affiliationNumber).then(function(data) {
            if(data.error) {
                $scope.showAlert(data.error);
            } else {
                $scope.affiliationData = data;
                AffiliationService.store(data).then(function(success){
                    if(success) {
                        AffiliationDTO.setAffiliationData(data);
                        $state.go('affiliated');
                    }
                    $ionicLoading.hide();
                })
            }
        }, function(error) {
            console.error(error)
            $ionicLoading.hide();
        });
    }
    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            template: '<i class="fa fa-exclamation-circle" aria-hidden="true">'+message+'</i>'
        });

        alertPopup.then(function(res) {
            this.affiliationNumber = '';
        });
    };
})

.controller('successController', function($scope, $rootScope, $state, AffiliationDTO,OtpService,$ionicLoading) {
    $scope.affiliationData = AffiliationDTO.getAffiliationData();
    $scope.home = function() {
        console.log("Reached here Ji");
        OtpService.getStoredStudentId().then(function(studentIdData) {
				console.log("studentIdData="+studentIdData);
				if(studentIdData.length == 0) {
                    //AffiliationDTO.setAffiliationData(data);
                    $state.go("studentIdValidate")					
				} else {
                    $rootScope.studentId = studentIdData[0];
					$state.go("menu.home") 
				}
				$ionicLoading.hide();
			}, function(error){
                console.error(error);
                $ionicLoading.hide();
            });
    }
})

.controller('StudentIdController', function($scope, $rootScope,AffiliationDTO, $state,GenerateOtpService,$ionicLoading,$ionicPopup,OtpService) {
    $scope.affiliationData = AffiliationDTO.getAffiliationData();
    $scope.validateStudentId = function() {
        var studentId=this.studentId;
        
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        
        $rootScope.studentId = studentId;
        GenerateOtpService.generatedOtp(studentId).then(function(data) {
            if(data.error) {
                
                $scope.showAlert(data.error);
            } else {
                console.log(data);
                $state.go('enterOtp');
                /*OtpService.storeStudentId(studentId).then(function(success){
                    if(success) {
                        //AffiliationDTO.setAffiliationData(data);
                        $state.go('enterOtp');//send to otp entering page
                    }
                    $ionicLoading.hide();
                })*/
                    //$state.go("menu.home")
            }
            $ionicLoading.hide();
        }, function(error) {
            console.error(error)
            $ionicLoading.hide();
        });
    }

    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            template: '<i class="fa fa-exclamation-circle" aria-hidden="true">'+message+'</i>'
        });

        alertPopup.then(function(res) {
            this.affiliationNumber = '';
        });
    };
})

.controller('otpEnterController', function($scope, $rootScope, $state, AffiliationDTO,$ionicLoading,ValidateOtpService,OtpService) {
    $scope.affiliationData = AffiliationDTO.getAffiliationData();
    var studentIdData=$rootScope.studentId;
    $scope.home = function() {
        console.log("Reached here "+studentIdData);
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        ValidateOtpService.validateOtp(this.otp,studentIdData).then(function(studentIdData) {
				console.log("studentIdData="+studentIdData);
				if(studentIdData.length == 0) {
                    AffiliationDTO.setAffiliationData(data);
                    $state.go("studentIdValidate")					
				} else {
                    $rootScope.studentId = studentIdData[0];
                    OtpService.storeStudentId(studentIdData[0]).then(function(success){
                    
                    if(success) {
                        
                        //AffiliationDTO.setAffiliationData(data);
                       $state.go("menu.home");//send to otp entering page
                    }

                    $ionicLoading.hide();
                })
					 
				}
				$ionicLoading.hide();
			}, function(error){
                console.error(error);
                $ionicLoading.hide();
            });
    }
})

.controller('MenuController', function(){

})

.controller('HomeController', function($scope, $rootScope, $ionicLoading, 
        MenuDetailService, MENU_ITEM_MASTER, GetSchoolWebsiteService, GetSchoolInfo) {
    var studentId = $rootScope.studentId; //'TEC005'
    var menuItems = [];
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    MenuDetailService.fetchMenuDetails(studentId).then(function(menuData){
        var photo = menuData.photo;
        $rootScope.userType = menuData.userType;
        
        GetSchoolInfo.setSchoolInfo(menuData);

        menuData.photo = $scope.checkPhoto(photo, menuData.userType);

        $scope.menuData = menuData;

        for(var idx in menuData.menuDetails) {
            var menuDetail = menuData.menuDetails[idx];
            var menuDetailMaster = MENU_ITEM_MASTER[menuDetail.mobile_menu_id];
            if(menuDetailMaster.title) {
                menuDetailMaster.url = menuDetail.url;
                menuItems.push(menuDetailMaster);
            }
        }

        $scope.entries = menuItems;
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    $scope.checkPhoto = function(photo, type){
        var isImage = photo ? photo.substr(photo.lastIndexOf('/')+1, photo.length) : null;
        if(isImage !== 'null' && type !== 'Teacher'){
            return photo;
        }else{
            return 'img/man-placeholder.jpg';
        }
    };

    $scope.getDirections = function(ev){
        ev.preventDefault();
        GetSchoolWebsiteService.getWebsite(studentId).then(function(url){
            window.open(url.WEB_SITE, '_blank');
            $ionicLoading.hide();
        }, function(error) {
            console.error(error);
            $ionicLoading.hide();
        });
    }

})

.controller('locationController', function($scope, $rootScope, $ionicLoading, SchoolLocationService) {
    var studentId = $rootScope.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    SchoolLocationService.getLocation(studentId).then(function(position){
        var pos = position.LOCATION_COORDINATES,
            lat = pos.substr(0, pos.indexOf(',')),
            long = pos.substr(pos.indexOf(',')+1, pos.length);

        var latLng = new google.maps.LatLng(lat, long);
 
        var mapOptions = {
          center: latLng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
     
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

        google.maps.event.addListenerOnce($scope.map, 'idle', function(){
 
            var marker = new google.maps.Marker({
              map: $scope.map,
              animation: google.maps.Animation.DROP,
              position: latLng
            });      

        });

        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    
  
})

//.controller('DocsAndSyllabusController', function($scope, $stateParams))

.controller('TimeTableController', function($scope, $rootScope, $stateParams, TimeTableService, $ionicLoading,  $ionicSlideBoxDelegate) {
    var studentId = $rootScope.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    
    TimeTableService.fetchTimeTable(studentId).then(function(timeTableData){
        $scope.timetableSet = timeTableData;
        $ionicSlideBoxDelegate.update();
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    var curDate = new Date();
    $scope.slideIndex = curDate.getDay() === 0 ? 0: curDate.getDay()-1;
    $scope.curDayLabel = returnDay($scope.slideIndex);

    $scope.next = function(swipe) {
        $scope.slideIndex += 1;
        $scope.curDayLabel = returnDay($scope.slideIndex);
        if(!swipe) $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function(swipe) {
        $scope.slideIndex -= 1;
        $scope.curDayLabel = returnDay($scope.slideIndex);
        if(!swipe) $ionicSlideBoxDelegate.previous();
    };
    
    $scope.slideHasChanged = function($index, type){
        if(type === 'right'){
            if($scope.slideIndex !== 0){
                $scope.previous(true);
            }
            
        }else if(type ==='left') {
            if($scope.slideIndex !== 5){
               $scope.next(true);
            }
            
        }
    };

    function returnDay(num){
        var weekDay = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return weekDay[num];
    }

})

.controller('AttendanceController', function($scope, $rootScope, AttendanceService, $ionicLoading, $ionicSlideBoxDelegate, $timeout) {
    
    var studentId = $rootScope.studentId,
        date = new Date(),
        month = date.getMonth() < 9 ? '0'+(date.getMonth()+1) : date.getMonth()+1,
        dateToFetch = '01'+month+date.getFullYear();

        $scope.currentMonth =  date.getMonth() < 3 ? date.getMonth() + 9 : date.getMonth()-3;

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    getData(dateToFetch);

    function getData(dateToFetch){
        AttendanceService.fetchAttendance(studentId, dateToFetch).then(function(attendanceData){
            var curMonth = date.getMonth(),
                howMuchToRemove = curMonth < 3 ? curMonth + 10 : curMonth-2;

            attendanceData.attendanceMonth = attendanceData.attendanceMonth.splice(0, howMuchToRemove);
            $scope.attendance = attendanceData;
            $scope.attendance.attendanceDetails.attendance = mainpulateDatesToRender(attendanceData.attendanceDetails.attendance);
            $ionicSlideBoxDelegate.update();
            $scope.curDayLabel = $scope.attendance.attendanceDetails.monthName;
            $ionicLoading.hide();
        }, function(error) {
            console.error(error);
            $ionicLoading.hide();
        });  
    }

    function mainpulateDatesToRender(data){
        var myObj = [],
            curRow = [];
        for(var i=0; i<data.length; i++){
            
            if(i === 0){
                var firstDay = data[0].dayName;

                if(firstDay === 'Monday'){
                    curRow.push({type:'blank'}, data[i]);
                }else if(firstDay === 'Tuesday'){
                    curRow.push({type:'blank'}, {type:'blank'}, data[i]);
                }else if(firstDay === 'Wednesday'){
                    curRow.push({type:'blank'}, {type:'blank'}, {type:'blank'}, data[i]);
                }else if(firstDay === 'Thursday'){
                    curRow.push({type:'blank'}, {type:'blank'}, {type:'blank'}, {type:'blank'}, data[i]);
                }else if(firstDay === 'Friday'){
                    curRow.push({type:'blank'}, {type:'blank'}, {type:'blank'}, {type:'blank'}, {type:'blank'}, data[i]);
                }else if(firstDay === 'Saturday'){
                    curRow.push({type:'blank'}, {type:'blank'}, {type:'blank'}, {type:'blank'}, {type:'blank'}, {type:'blank'}, data[i]);
                    myObj.push(curRow);
                    curRow = [];
                }else{
                   curRow.push(data[i]);
                }

            }else{
                curRow.push(data[i]);
                if(data[i].dayName === 'Saturday' || i === data.length-1){
                    myObj.push(curRow);
                    curRow = [];
                }          
            }
        }
        
        return myObj;
    }


    var curDate = new Date();
    $scope.slideIndex = curDate.getMonth() < 3 ? curDate.getMonth() + 9 : curDate.getMonth()-3,
    curSlide = $scope.slideIndex;
    
    $scope.disableSwipe = function() {
        $ionicSlideBoxDelegate.enableSlide(false);
    };

    $scope.next = function(isSwipe) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var newMonth = parseInt(month)+1;
        month = newMonth < 10 ? '0'+(newMonth) : newMonth;
        dateToFetch = '01'+month+date.getFullYear();
        getData(dateToFetch);
        $scope.slideIndex += 1;
        if(!isSwipe) $ionicSlideBoxDelegate.next();
    };

    $scope.previous = function(isSwipe) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var newMonth = parseInt(month)-1;
        month = newMonth < 10 ? '0'+(newMonth) : newMonth;
        dateToFetch = '01'+month+date.getFullYear();
        getData(dateToFetch);
        $scope.slideIndex -= 1;
        if(!isSwipe) $ionicSlideBoxDelegate.previous();
    };

    $scope.slideHasChanged = function($index, type){
        if(type === 'right'){
            if($scope.slideIndex !== 0){
                $scope.previous(true);
            }
            
        }else if(type ==='left') {
            if($scope.slideIndex !== $scope.currentMonth){
               $scope.next(true);
            }
            
        }
    };

})


.controller('NewsEventsController', function($scope, $rootScope, NewsEventsService, 
    $ionicLoading, $ionicSlideBoxDelegate, $timeout) {
   
    var studentId = $rootScope.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    var curDate = new Date();
    $scope.slideIndex = curDate.getMonth() > 2 ? curDate.getMonth()-3 : curDate.getMonth()+10;

    $scope.curDayLabel = month($scope.slideIndex)+'-'+curDate.getFullYear();

    NewsEventsService.fetchNewsEvent($scope.curDayLabel+'-'+curDate.getFullYear()).then(function(newsEvents){
        $scope.newsEventsSet = newsEvents;
        $ionicSlideBoxDelegate.update();
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    $scope.next = function(isSwipe) {
        $scope.slideIndex += 1;
        var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;
        $scope.curDayLabel = month($scope.slideIndex)+'-'+year;
        if(!isSwipe) $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function(isSwipe) {
        $scope.slideIndex -= 1;
        var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;
        $scope.curDayLabel = month($scope.slideIndex)+'-'+year;
        if(!isSwipe) $ionicSlideBoxDelegate.previous();
    };
    
    $scope.slideHasChanged = function($index, type){
        if(type === 'right'){
            if($scope.slideIndex !== 0){
                $scope.previous(true);
            }
            
        }else if(type ==='left') {
            if($scope.slideIndex !== 11){
               $scope.next(true);
            }
            
        }
    };

    $scope.readMoreLess = function(event){
        event.full = !event.full;
    };

    function month(num){
       var monthName = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        return monthName[num];
    }

})

.controller('PlannerController', function($scope, $rootScope, PlannerService, $ionicPopup, 
    $ionicLoading, $ionicSlideBoxDelegate, $timeout, CalendarDatesFactory) {
   
    var studentId = $rootScope.studentId,
        calendarFactory;
   
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    var curDate = new Date();
    $scope.slideIndex = curDate.getMonth() > 2 ? curDate.getMonth()-3 : curDate.getMonth()+9;
    $scope.curDayLabel = month($scope.slideIndex)+'-'+curDate.getFullYear();

    PlannerService.fetchPlanner($scope.curDayLabel).then(function(planner){
        calendarFactory = angular.copy(CalendarDatesFactory.calendarDates());

        $scope.planner = planner;
        dataForCurMonth();
        
        $ionicSlideBoxDelegate.update();
        $ionicLoading.hide();

    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    function dataForCurMonth(){
        var monthToShow = calendarFactory[$scope.slideIndex],
            plannerCurMonth = $scope.planner[$scope.slideIndex],
            splittedToRow = [];

        if(!monthToShow.splitted){
            for(var i =0; i<plannerCurMonth.eventDetails.length;i++){
                var stringToFind = plannerCurMonth.eventDetails[i].toDate.split('-')[0];
                for(z = 0; z<monthToShow.days.length; z++){
                    if(monthToShow.days[z].date && monthToShow.days[z].date.toString() === stringToFind){
                        monthToShow.days[z].fontColor = '#0431b4';
                        monthToShow.days[z].fontWeight = 'bold';
                    }
                }
            }

            while(monthToShow.days.length){
                splittedToRow.push(monthToShow.days.splice(0,7));
            }

            monthToShow.days = splittedToRow;
            monthToShow.splitted = true;
            $scope.calenderToRender = calendarFactory;
        }
        $scope.eventDetails = $scope.planner[$scope.slideIndex];
    }

    $scope.showEvent = function(date) {
        var events = $scope.eventDetails.eventDetails;
        for(var i =0; i<events.length; i++){
            var split = events[i].fromDate.split('-')[0],
                toSplit = events[i].toDate.split('-')[0];
            if(parseInt(date) === parseInt(split) || parseInt(date) === parseInt(toSplit)){
                $scope.showAlert('<h5>'+events[i].eventName+'</h5><p>'+events[i].description+'</p><p><strong>From: </strong>'+events[i].fromDate+'</strong>&nbsp;&nbsp;&nbsp;<strong>To: </strong>'+events[i].toDate+'</p>');
            }
        }
    };

    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            title: 'Event',
            template: message
        });

        alertPopup.then(function(res) {
            this.affiliationNumber = '';
        });
    };

    $scope.next = function(isSwipe) {
        $scope.slideIndex += 1;
        dataForCurMonth();
        var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;

        $scope.curDayLabel = month($scope.slideIndex)+'-'+year;

        $ionicSlideBoxDelegate.update();
        if(isSwipe) $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function(isSwipe) {
        $scope.slideIndex -= 1;
        dataForCurMonth();
        var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;
        $scope.curDayLabel = month($scope.slideIndex)+'-'+year;

        $ionicSlideBoxDelegate.update();
        if(isSwipe) $ionicSlideBoxDelegate.previous();
    };
    
    $scope.slideHasChanged = function($index, type){
        if(type === 'right'){
            if($scope.slideIndex !== 0){
                $scope.previous(true);
            }
            
        }else if(type ==='left') {
            if($scope.slideIndex !== 11){
               $scope.next(true);
            }
            
        }
        $ionicSlideBoxDelegate.update();
    };

    function month(num){
        var monthName = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        return monthName[num];
    }

})

.controller('InboxController', function($scope, $rootScope, InboxService, $ionicPopup, $ionicLoading) {
    var studentId = $rootScope.studentId,
        date = new Date(),
        getDate = date.getDate() < 10 ? '0'+date.getDate() : date.getDate(),
        getMonth = date.getMonth() < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1,
        curDate = getDate+''+getMonth+date.getFullYear(),
        bgColors = ['#5eec07', '#387ef5', '#33cd5f', '#886aea', '#00ffe9', '#da00ff'],
        counter = 0;
    $scope.searchDate = "";
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    $scope.search = false;
    $scope.inboxMessages = [];

    //fetchMessage(null, counter);

    function fetchMessage(date, param){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        InboxService.fetchInbox(studentId, date, param).then(function(messages){
            for(var i in messages){
                $scope.inboxMessages.push(messages[i]);
            }
            
            $scope.$broadcast('scroll.infiniteScrollComplete');
            $ionicLoading.hide();
        }, function(error) {
            console.error(error);
            $ionicLoading.hide();
        });
    }

    $scope.readAcknowledge = function(message, prop){
        if(message[prop].charAt(0) === '*'){
            message[prop] = message[prop].replace('*', '');
        }
        $scope.showAlert(message);
    };

    $scope.loadMore = function() {
        counter += 1;
        fetchMessage(null, counter);
    };

    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            title: message.message_head,
            template: '<p>'+message.message_text+'</p>'
        });

        alertPopup.then(function(res) {
            this.affiliationNumber = '';
        });
    };

    $scope.$on('$stateChangeSuccess', function() {
        $scope.loadMore();
    });

    $scope.calcBgColor = function(){
        var randomIndex = Math.floor(Math.random() * 5) + 1;
        return {
            backgroundColor: bgColors[randomIndex]
        }
    }

    $scope.searchMessage = function(searchDate){
        $scope.search = true;
        $scope.inboxMessages = [];
        var dateSplit = searchDate.split('-'),
            dateToSearch = '';
        for(var i =0; i<dateSplit.length; i++){
            dateToSearch += dateSplit[i];
        }
        fetchMessage(dateToSearch, null);
    }

})

.controller('AchievementsController', function($scope, $rootScope, AchievementsService, $ionicLoading) {
    var studentId = $rootScope.studentId;        
    
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    AchievementsService.fetchAchievements(studentId).then(function(achievements){
        $scope.achievements = achievements;
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });
})

.controller('DocsAndSyllabusController', function($scope, $rootScope, DocsAndSyllabusService, $ionicLoading) {
    var studentId = $rootScope.studentId,
        sectionOrCode = $rootScope.userType === 'Teacher' ? $rootScope.sectionCodeDoc : $rootScope.studentId;;

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    DocsAndSyllabusService.fetchDocsAndSyllabusHead($rootScope.userType, sectionOrCode).then(function(docsAndSyllabusHead){
        $scope.docsAndSyllabusHead = docsAndSyllabusHead;
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    $scope.getDetails = function(docType){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        $scope.documentType = docType;
        DocsAndSyllabusService.fetchDocsAndSyllabusDetails($rootScope.userType, sectionOrCode, docType).then(function(docsAndSyllabusDetails){
            $scope.docsAndSyllabusDetails = docsAndSyllabusDetails;
            $ionicLoading.hide();
        }, function(error) {
            console.error(error);
            $ionicLoading.hide();
        });
    };
})

.controller('MarksController', function($scope, $rootScope, MarksService, $ionicLoading, $state) {
    var studentId = $rootScope.studentId;        
    
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    MarksService.fetchExams(studentId).then(function(exams){
        $scope.exams = exams;
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

    $scope.goToMarks = function(exam){
        $state.go('menu.examsMarks', {examId: exam.examCode});
    };

})

.controller('ExamMarksController', function($scope, $rootScope, MarksService, $ionicLoading, $stateParams) {
    var studentId = $rootScope.studentId;        
    
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    MarksService.fetchMarks(studentId, $stateParams.examId).then(function(marks){
        $scope.examMarksDetails = marks.examMarksDetails;
        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });

})

.controller('OnlineFeedbackController', function($scope, $rootScope, OnlineFeedbackService, $ionicLoading, $ionicPopup) {
    var studentId = $rootScope.studentId;   
         
    $scope.payload = {
        un :studentId,
        userName : $scope.userName,
        contactNo : $scope.contactNo,
        email: $scope.email,
        subj: $scope.subj,
        comments: $scope.comments
    };

    $scope.contactPlaceholder = "Please enter your contact number";
    $scope.emailPlaceholder = "Please enter your email ID";

    $scope.validateContact = function(payLoadContact){
        if(payLoadContact.length < 10 || isNaN(payLoadContact)){
            $scope.payload.contactNo = '';
            $scope.contactPlaceholder = 'Please enter valid contact number.';
        }
    };

    $scope.validateEmail = function(payLoadEmail){
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!re.test(payLoadEmail)){
            $scope.payload.email = '';
            $scope.emailPlaceholder = 'Please enter valid email ID.';
        }
    };

    $scope.calcDisabled = function(){
        var status = false; 
        for(var i in $scope.payload){
            if(!$scope.payload[i]){
                status = true;
                break;
            }
        }
        return status;
    };

    $scope.saveFeedback = function(){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        OnlineFeedbackService.saveFeedback($scope.payload).then(function(res){
            $ionicLoading.hide();
            if(res.successStatus){
               $scope.showAlert('Thanks for the feedback!. Your ticket number is: '+res.ticketNo); 
               for (var i in $scope.payload){
                    $scope.payload[i] = '';
               }
            }else{
                alert('Some error occured. Please try again.');
            }
        }, function(error) {
            console.error(error);
            $ionicLoading.hide();
        });
    };

    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            title: 'Online Feedback',
            template: message
        });
    };


})

.controller('DisciplineController', function($scope, $rootScope, DisciplineService, $ionicLoading) {
    var studentId = $rootScope.studentId;        
    
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });
    
    DisciplineService.getDisciplines(studentId).then(function(disciplines){
        $scope.disciplines = disciplines;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });
})

.controller('HomeworkController', function($scope, $rootScope, HomeworkService, $ionicLoading, ionicDatePicker ) {
    var studentId = $rootScope.studentId,
        date = new Date(),
        counter = 0;        
    
    fetchHomework(counter);

    function fetchHomework(counter){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        $scope.slideIndex = counter;
        HomeworkService.fetchHomework(studentId, counter).then(function(hwWork){
            $scope.hwWork = hwWork;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    }
    
    $scope.getResults = function(type){
        counter = type === 'increment' ? counter+1 : counter-1;
        fetchHomework(counter);
    }

    $scope.slideHasChanged = function(type){
        if(type === 'increment'){
           $scope.getResults('increment');            
        }else{
            if(counter > 0){
                $scope.getResults('decrement');            
            }
        }
    };

    function daydiff(first, second) {
        return Math.round((second-first)/(1000*60*60*24));
    }


    var ipObj1 = {
        callback: function (val) {  //Mandatory
            counter = Math.abs(daydiff(new Date(), new Date(val)));
            fetchHomework(counter);
        },
        from: new Date(2012, 1, 1), //Optional
        to: new Date(), //Optional
        inputDate: new Date(),      //Optional
        mondayFirst: true,          //Optional
        disableWeekdays: [0],       //Optional
        closeOnSelect: true,       //Optional
        templateType: 'popup'       //Optional
    };

    $scope.showCalendar = function(){
        ionicDatePicker.openDatePicker(ipObj1);
    };

    
})

.controller('ThoughtOfTheDayController', function($scope, $rootScope, ThoughtOfTheDayService, 
    $ionicLoading, $ionicSlideBoxDelegate, $timeout, CalendarDatesFactory, $ionicPopup) {
    
    var studentId = $rootScope.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    var curDate = new Date();
    $scope.slideIndex = curDate.getMonth() > 2 ? curDate.getMonth()-3 : curDate.getMonth()+9;

    var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;
    $scope.curDayLabel = month($scope.slideIndex)+'-'+year;
    var curDay = curDate.getDate() < 10 ? '0'+curDate.getDate() : curDate.getDate(),

        currentDateLabel = month($scope.slideIndex)+' '+curDay+', '+year;


    ThoughtOfTheDayService.fetchThoughtOfTheDay(studentId).then(function(thoughts){
        calendarFactory = angular.copy(CalendarDatesFactory.calendarDates());
        $scope.thoughts = thoughts;
        $scope.dataForCurMonth();
        $ionicSlideBoxDelegate.update();
        
        for (var i =0; i<$scope.thoughts.length; i++){
            if($scope.thoughts[i].messageDate === currentDateLabel){
                $scope.curDayThought = $scope.thoughts[i].message;
                break;
            }
        }

        $ionicLoading.hide();
    }, function(error) {
        console.error(error);
        $ionicLoading.hide();
    });


    $scope.dataForCurMonth = function(){
        var calendarToRender = [];

        for (var i =0; i<$scope.thoughts.length; i++){
            var monthSplit = $scope.thoughts[i].messageDate.split(' '),
                curMonth = findIndex(monthSplit[0]),
                dateSplit = parseInt(monthSplit[1]),
                objToOperate,
                dateSplitDelta = 0;
            for(var z=0; z<7; z++){
                if(calendarFactory[curMonth].days[z].type){
                    dateSplitDelta++;
                }
            }

            objToOperate = calendarFactory[curMonth].days[dateSplit+dateSplitDelta-1];
            objToOperate.fontColor = '#0431b4';
            objToOperate.fontWeight = 'bold';
            objToOperate.showMessage = $scope.thoughts[i];
        };

        for(var i = 0; i<calendarFactory.length; i++){
            var monthToRender = [];
            while(calendarFactory[i].days.length){
                monthToRender.push(calendarFactory[i].days.splice(0,7));
            }
            calendarToRender.push(monthToRender);
        };

        $scope.thoughtsFullYear = calendarToRender;
        
    };

    $scope.showEvent = function(day) {
        if(day.showMessage){
            $scope.showAlert('<p><strong>Date: </strong>'+day.showMessage.messageDate+'</strong></p><p><strong>Message: </strong>'+day.showMessage.message+'</p>');
        }
        
    };

    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            title: 'Thought of the day',
            template: message
        });

    };

    $scope.next = function(isSwipe) {
        $scope.slideIndex += 1;
        var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;
        $scope.curDayLabel = month($scope.slideIndex)+'-'+year;
        if(!isSwipe) $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function(isSwipe) {
        $scope.slideIndex -= 1;
        var year = $scope.slideIndex < 9 ? curDate.getFullYear() : curDate.getFullYear()+1;
        $scope.curDayLabel = month($scope.slideIndex)+'-'+year;
        if(!isSwipe) $ionicSlideBoxDelegate.previous();
    };
    
    $scope.slideHasChanged = function($index, type){
        if(type === 'right'){
            if($scope.slideIndex !== 0){
                $scope.previous(true);
            }
            
        }else if(type ==='left') {
            if($scope.slideIndex !== 11){
               $scope.next(true);
            }
            
        }
    };

    function month(num){
        if (num > 11){num = num - 12;}
        var monthName = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        return monthName[num];
    }

    function findIndex(num){
        var monthName = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
        return monthName.indexOf(num);
    }

})

.controller('TeacherAttendanceController', function($scope, $rootScope, $ionicLoading, TeacherAttendenceService, $state) {
    var studentId = $rootScope.studentId,
        classCode,
        sectionCode;        

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });  
    
    TeacherAttendenceService.fetchClass().then(function(classes){
        $scope.classes = classes;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.getSections = function(classCode){
        classCode = classCode;
        TeacherAttendenceService.fetchSection(classCode).then(function(sections){
            $scope.sections = sections;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.setSection = function(sectionCode){
        sectionCode = sectionCode;
    };

    $scope.getStudentList = function(classCode, sectionCode){
        $state.go('menu.markAttendance', {class : classCode, section : sectionCode});
    };
    
})


.controller('TeacherMarkAttendanceController', function($scope, $rootScope, $ionicLoading, TeacherAttendenceService, $stateParams) {
    var studentId = $rootScope.studentId,
        classCode = $stateParams.class,
        sectionCode = $stateParams.section;

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });  

    TeacherAttendenceService.fetchStudent(classCode, sectionCode).then(function(studentList){
        $scope.studentList = studentList;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.markAttendance = function(student, status){
        student.ATTENDANCE = status;
    };

    $scope.saveAttendance = function(status){
       $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });  

        var studentListToSend = [];

        for(var i = 0; i<$scope.studentList.length; i++){
            studentListToSend.push({
                studentId: $scope.studentList[i].STUDENTID,
                sectionCode: $scope.studentList[i].SECTIONCODE,
                attendance: $scope.studentList[i].ATTENDANCE,
                attendance_taken_by: studentId
            })
        }
       
        TeacherAttendenceService.saveAttendance(studentListToSend).then(function(status){
            $ionicLoading.hide();
            alert('Saved successfully');
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };
    
})

.controller('TeacherExamMarksController', function($scope, $rootScope, $ionicLoading, TeacherExamMarksService, $state) {
    var studentId = $rootScope.studentId;

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    TeacherExamMarksService.fetchClass().then(function(classes){
        $scope.classes = classes;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.getSections = function(classCode){
        TeacherExamMarksService.fetchSection(classCode).then(function(sections){
            $scope.sections = sections;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.fetchExamName = function(classCode, sectionCode){
        TeacherExamMarksService.fetchExamName(classCode, sectionCode).then(function(examNames){
            $scope.examNames = examNames;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.fetchSubjects = function(classCode, sectionCode, examCode){
        TeacherExamMarksService.fetchSubjects(classCode, sectionCode, examCode).then(function(subjects){
            $scope.subjects = subjects;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.getExamDetails = function(classCode, sectionCode, examCode, subjectCode){
        $state.go('menu.getExamSubject', {classCode:classCode, sectionCode:sectionCode, examCode:examCode, subjectCode:subjectCode});
        //$state.go('menu.getExamSubject', {classCode:'CLM6', sectionCode:'BRN6', examCode:'ENM1', subjectCode:'SBM13'});
    };

    $ionicLoading.hide();
    
})

.controller('TeacherExamSubjectController', function($scope, $rootScope, $ionicLoading, TeacherExamMarksService, $stateParams, $state) {
    var studentId = $rootScope.studentId,
        classCode,
        sectionCode;        

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });  

    TeacherExamMarksService.searchExams($stateParams.classCode, $stateParams.sectionCode, $stateParams.examCode, $stateParams.subjectCode).then(function(subjects){
        $scope.subjects = subjects;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.gotoDetailView = function(choosenSubject){
        $state.go('menu.viewExamResult', {
            classCode:$stateParams.classCode, 
            sectionCode:$stateParams.sectionCode, 
            examCode:$stateParams.examCode, 
            subjectCode:$stateParams.subjectCode, 
            examActivityCode: choosenSubject.ACTIVITYCODE,
            subActivityCode:  choosenSubject.SUBACTIVITYCODE ? choosenSubject.SUBACTIVITYCODE : 0
        });
    };
    
})

.controller('TeacherViewResultController', function($scope, $rootScope, $ionicLoading, TeacherExamMarksService, $stateParams) {
    var studentId = $rootScope.studentId,
        classCode,
        sectionCode;        

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });  

    TeacherExamMarksService.viewResults($stateParams.classCode, $stateParams.sectionCode, $stateParams.examCode, $stateParams.subjectCode, $stateParams.examActivityCode, $stateParams.subActivityCode).then(function(results){
        $scope.results = results;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });
    
})

.controller('SearchDisciplineController', function($scope, $rootScope, $ionicLoading, DisciplineTeacherService, $state) {
    var studentId = $rootScope.studentId;

    $scope.searchStudent = function(studentName){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });  
        DisciplineTeacherService.fetchStudent(studentName).then(function(studentList){
            $scope.studentList = studentList;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    }

    $scope.goto = function(view, student){
        $state.go(view, { studentId: student.studentId,  studentName: student.studentName })
    }         
})

.controller('ViewDisciplineController', function($scope, $rootScope, $ionicLoading, DisciplineTeacherService, $stateParams) {
    var studentId = $stateParams.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    }); 
    $scope.studentName = $stateParams.studentName;

    DisciplineTeacherService.viewDiscipline(studentId).then(function(defaults){
        $scope.defaults = defaults;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });
})

.controller('uploadDocsMainController', function($scope, $state) {
    $scope.goTo = function(whichPage){
        if(whichPage === 'uploadDocsTeacher'){
            $state.go('menu.uploadDocsTeacher');
        }else{
            $state.go('menu.selectDocsTeacher');
        }
    };
})

.controller('uploadDocsTeacherController', function($scope, 
    $rootScope, $cordovaFileTransfer,
    $ionicPopup, $ionicLoading, 
    TeacherExamMarksService, DocumentTeacherService, 
    $ionicPopup, $stateParams, $state) {
    var studentId = $rootScope.studentId,
    tempPath;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    TeacherExamMarksService.fetchClass().then(function(classes){
        $scope.classes = classes;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    DocumentTeacherService.fetchDocumentType().then(function(documentTypes){
        $scope.documentTypes = documentTypes;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.getSections = function(classCode){
        TeacherExamMarksService.fetchSection(classCode).then(function(sections){
            $scope.sections = sections;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.fetchSubjects = function(classCode, sectionCode, examCode){
        TeacherExamMarksService.fetchSubjects(classCode, sectionCode, examCode).then(function(subjects){
            $scope.subjects = subjects;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.showAlert = function(title, message) {
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: '<p>'+message+'</p>'
        });

        alertPopup.then(function(res) {
            if(title === 'Upload success'){
                $state.go('menu.getDocListByTeachers');
            }
        });
    };

    $scope.getTheFiles = function ($files) {
        var file = $files[0];
        var fileExtension = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length);
        if(fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'pdf'){
            $scope.file = file;
            $scope.$apply();
        }else{
            delete $scope.file;
            $scope.showAlert('Upload error', 'Please select .pdf or .jpg files only.');
        }
        
    };
   
    $scope.uploadDoc = function(classCode, sectionCode, documentType, fileObj, remark, event){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        DocumentTeacherService.saveDocument($scope.file, sectionCode, documentType, remark).then(function(res){
            $ionicLoading.hide();
            $scope.showAlert('Upload success', 'Your file has been uploaded successfully.');
        }, function(error) {
            $scope.showAlert('Upload error', 'Error while uploading file.');
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

})

.controller('selectDocsTeacherController', function($scope, $rootScope, $ionicPopup, $ionicLoading, TeacherExamMarksService, DocumentTeacherService, $ionicPopup, $stateParams, $state) {
    var studentId = $rootScope.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    TeacherExamMarksService.fetchClass().then(function(classes){
        $scope.classes = classes;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.getSections = function(classCode){
        TeacherExamMarksService.fetchSection(classCode).then(function(sections){
            $scope.sections = sections;
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.viewDoc = function(sectionCode){
        $rootScope.sectionCodeDoc = sectionCode;
        $state.go('menu.docsAndSyllabus');
    };
  
})

.controller('EntryDisciplineController', function($scope, $rootScope, $ionicLoading, DisciplineTeacherService, $ionicPopup, $stateParams, $state) {
    var studentId = $stateParams.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    $scope.studentName = $stateParams.studentName;
    
    DisciplineTeacherService.getDiscipline(studentId).then(function(defaultTypes){
        $scope.defaultTypes = defaultTypes;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.raiseDiscipline = function(defaultList, remark){
        var defaultsToSend = [];
        for(var i=0; i<defaultList.length; i++){
            for(var z=0; z<defaultList[i].SubCategoryDetail.length; z++){
                if(defaultList[i].SubCategoryDetail[z].selected){
                    defaultsToSend.push({
                        studentId: studentId,
                        disciplineCode: defaultList[i].SubCategoryDetail[z].subCategoryCode,
                        remark: remark ? remark : ' ',
                        createdBy: $rootScope.studentId 
                    });
                }
            }
        }
        DisciplineTeacherService.raiseDiscipline(defaultsToSend).then(function(status){
            $scope.showAlert();
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

    $scope.showAlert = function(message) {
        var alertPopup = $ionicPopup.alert({
            title: 'Discipline',
            template: '<p>Discipline issue raised</p>'
        });

        alertPopup.then(function(res) {
            $state.go('menu.disciplineTeacher');
        });
    };

    $scope.selectMe =function(category){
        category.selected = !category.selected;
    }
})

.controller('ptiController', function($scope, $rootScope, $ionicPopup, $ionicLoading, $stateParams, $state, PTIServices) {
    var studentId = $rootScope.studentId;
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    PTIServices.getPtiDetails(studentId).then(function(interactions){
        var dataToSet = {},
            createInteractionByTeacher = {};
        for(var i in interactions.messageHistory){
            var teacherNode = interactions.messageHistory[i].teacher.split(' ').join('');
            if(!createInteractionByTeacher[teacherNode]){
                createInteractionByTeacher[teacherNode] = {
                    teacherName : interactions.messageHistory[i].teacher,
                    interactions : []
                }
            }

            createInteractionByTeacher[teacherNode].interactions.push(interactions.messageHistory[i]);
        }

        dataToSet.interactions = createInteractionByTeacher;
        dataToSet.teacherList = interactions.subjectTeacher;
        $scope.ptis = dataToSet.interactions;

        PTIServices.setPTIData(dataToSet);
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.detailPTI = function(teacherID){
       $state.go('menu.ptiDetails', {teacherID: teacherID})
    };
})

.controller('ptiDetailsController', function($scope, $rootScope, $ionicPopup, $ionicLoading, $stateParams, PTIServices) {
    var teacherToShow = PTIServices.getPTIData().interactions[$stateParams.teacherID];
    $scope.interactionDetail = teacherToShow.interactions;
})

.controller('ptiNewController', function($scope, $rootScope, $ionicPopup, $ionicLoading, $stateParams, $state, PTIServices) {
    var studentId = $rootScope.studentId;

    $scope.payload = {
        un : studentId,
        subj : '',
        comments : ''
    };

    $scope.countries_text_multiple = 'Choose teachers';
    $scope.teacherList = angular.copy(PTIServices.getPTIData().teacherList);
    var teacherListToPrint = [];
    for(var i = 0 ; i<$scope.teacherList.length; i++){
        teacherListToPrint.push({
            id : $scope.teacherList[i].teacherCode,
            text: $scope.teacherList[i].teacherName
        })
    }
    $scope.teacherListToPrint = teacherListToPrint;

    $scope.val =  {multiple: null};

    $scope.calcDisabled = function(){
        var status = false;
        for(var i in $scope.payload){
            if(!$scope.payload[i]){
                status = true;
                break;
            }
        }

        if(!$scope.val.multiple && !status){
            status = true;
        }

        return status;
    };

    $scope.sendMessage = function(){
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        $scope.payload.tecId = $scope.val.multiple.split(';').join(',');
        
        PTIServices.saveNewPti($scope.payload).then(function(response){

            var alertPopup = $ionicPopup.alert({
                title: 'Success',
                template: '<p>Your have raised a new query</p>'
            });
            alertPopup.then(function(res) {
                $state.transitionTo('menu.home', $stateParams, {reload:true, notify:true});
            });
            
            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };

})

.controller('ptiTeacherController', function($scope, $state) {
    $scope.goTo = function(whichPage){
        if(whichPage === 'newQueries'){
            $state.go('menu.ptiTeacherNewQueryList');
        }else{
            $state.go('menu.ptiTeacherRepliedQuery');
        }
    };
})

.controller('ptiTeacherNewQueryList', function($scope, $rootScope, $ionicLoading, $state, PTITeacherServices) {
   var studentId = $rootScope.studentId;

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    PTITeacherServices.ptiTeacherRepliedQuery(studentId).then(function(newQueries){
        $scope.newQueries = newQueries;
        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });

    $scope.replyQuery = function(query){
        PTITeacherServices.setCurQuery(query);
        $state.go('menu.ptiTeacherRespondQueryList');
    };
})

.controller('ptiTeacherRespondQueryList', function($scope, $rootScope, $ionicPopup, $ionicLoading, $state, $stateParams, PTITeacherServices) {
    var studentId = $rootScope.studentId;

    $scope.curQuery = PTITeacherServices.getCurQuery();

    $scope.saveReply = function(reply){
        var params = {
            chatId : $scope.curQuery.CHATID,
            tecId : studentId,
            reply : reply
        };

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        PTITeacherServices.savePtiReply(params).then(function(newQueries){
            var alertPopup = $ionicPopup.alert({
                title: 'Success',
                template: '<p>Your reply has been saved</p>'
            });

            alertPopup.then(function(res) {
                $state.go('menu.getNewPTIQueries');
            });

            $ionicLoading.hide();
        }, function(error) {
            console.error('err', error);
            $ionicLoading.hide();
        });
    };
})

.controller('ptiTeacherRepliedQuery', function($scope, $rootScope, $ionicPopup, $ionicLoading, $state, $stateParams, PTITeacherServices) {
    var studentId = $rootScope.studentId;

     $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
    });

    PTITeacherServices.ptiTeacherRepliedQuery(studentId).then(function(repliedQueries){
        $scope.repliedQueries = repliedQueries;

        $ionicLoading.hide();
    }, function(error) {
        console.error('err', error);
        $ionicLoading.hide();
    });
});