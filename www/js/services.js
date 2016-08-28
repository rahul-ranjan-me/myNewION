angular.module('aes.services', ['ionic', 'ngCordova', 'aes.constants'])
// DB wrapper
.factory('DB', function($q, DB_CONFIG, $cordovaSQLite) {
    var self = this;
    self.db = null;

    self.init = function() {
        var defered = $q.defer();
        
        if(window.cordova) {
            self.db = $cordovaSQLite.openDB({name: DB_CONFIG.name, location: 'default'});
        } else {
            self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        }
        var promises = null;
        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];

            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });

            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            
            if(promises === null) {
                promises = $cordovaSQLite.execute(self.db, query).then(function(data) {
                    console.log('Table ' + table.name + ' initialized');
                }, function(error){
                    defered.reject(error)
                });
            } else {
                promises.then(function(data) {
                    return $cordovaSQLite.execute(self.db, query).then(function(data) {
                        console.log('Table ' + table.name + ' initialized');
                    });
                }, function(error){
                    defered.reject(error)
                })
            }
            promises.then(function(data) {
                defered.resolve(data);
            })
        });
        return defered.promise;
    };
    
    
    self.getDb = function() {
        return self.db;
    }
    
    return self;
})

.factory('AffiliationService', function(DB, $cordovaSQLite, AffiliationDTO, $q, $http, AFFILIATION_SERVICE_URL) {
    var self = this;
    
    self.getStored = function() {
        console.log("Going to fetch stored properties");
        var query = 'SELECT affiliationCode, schoolName, schoolAddress, school_logo, ip FROM affiliation';
        return $cordovaSQLite.execute(DB.getDb(), query).then(function(result){
            console.log("found result "+result);
            if(result.rows.length>0) {
                var affiliationData = new Object();
                affiliationData.affiliationCode = result.rows.item(0).affiliationCode;
                affiliationData.schoolName = result.rows.item(0).schoolName;
                affiliationData.schoolAddress = result.rows.item(0).schoolAddress;
                affiliationData.school_logo = result.rows.item(0).school_logo;
                affiliationData.ip = result.rows.item(0).ip;

                return affiliationData;
            } else {
                console.log('No result found in DB');
            }
        }, function (error) {
            console.error(error);
            return $q.reject(error);
        });
    }

    self.fetchRemote = function(affiliationCode) {
        var affiliationResource = AFFILIATION_SERVICE_URL+affiliationCode;
        return $http.get(affiliationResource).then(function(response) {
            if(response.data["error:"]) {
                var errorObj = new Object();
                errorObj.error = response.data["error:"];
                return errorObj;
            }
            var affiliationData = new Object();
            affiliationData.affiliationCode = response.data.affiliationCode;
            affiliationData.schoolName = response.data.schoolName;
            affiliationData.schoolAddress = response.data.schoolAddress;
            affiliationData.school_logo = response.data.school_logo;
            affiliationData.ip = response.data.ip;

            return affiliationData;
        }, function(error) {
            console.error(error);
            return $q.reject(error);
        })
    }
    
    self.store = function(data) {
        console.log("going to insert affiliation data: "+data);
        var query = "INSERT INTO affiliation (affiliationCode, schoolName, schoolAddress, school_logo, ip) "+
            "VALUES (?, ?, ?, ?, ?)";
        return $cordovaSQLite.execute(DB.getDb(), query, 
            [
                data.affiliationCode,
                data.schoolName,
                data.schoolAddress, 
                data.school_logo, 
                data.ip
            ]).then(function(res) {
                console.log("affiliation inserted");
                return true;
            }, function (err) {
                console.error(err);
                return false;
            });
    }
    
    return self;
})

.factory('AffiliationDTO', function(){
    var self = this;
    var affiliationData = null;
    
    self.setAffiliationData = function(data) {
        affiliationData = data;
    };
    
    self.getAffiliationData = function() {
        return affiliationData;
    }
    
    return self;
})

.factory('OtpService', function(DB, $cordovaSQLite, $q, $http) {
    var self = this;
    
    self.getStoredStudentId = function() {
        console.log("Going to fetch stored studentid");
        var query = 'SELECT studentId FROM savedstudentid';
        return $cordovaSQLite.execute(DB.getDb(), query).then(function(result){
            console.log("found result "+result);
            var studentData = [];
            if(result.rows.length>0) {
                studentData[0] = result.rows[0].studentId;
                console.log('Result found in DB');
                //return "1";
            } else {
                console.log('No result found in DB');
                //return "2";
            }
            return studentData;
        }, function (error) {
            console.error(error);
            return $q.reject(error);
        }); 
    }

    self.storeStudentId = function(data) {
        console.log("going to insert studentId data: "+data);
        var query = "INSERT INTO savedstudentid (studentId) "+
            "VALUES (?)";
        return $cordovaSQLite.execute(DB.getDb(), query, 
            [
                data
            ]).then(function(res) {
                console.log("studentid inserted");
                return true;
            }, function (err) {
                console.error(err);
                return false;
            });
    }
    return self;
})

.factory('GenerateOtpService', function(AffiliationDTO, MENU_RESOURCE, $q, $http){
    var self = this;
    
    self.generatedOtp = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var otpService = "http://"+urlBase + "/rest/gStudentDtls/cDtlsWithOTP/" + studentId;
        console.log("GenerateOtpService "+otpService);
        $http.get(otpService).then(function(response) {
            if(response.data["error"]) {
                var errorObj = new Object();
                errorObj.error = response.data["error"];
                defered.resolve(errorObj);
            }
            else{
                    defered.resolve(response.data);
                }
            
        }, function(error) {
            console.error(error);
            defered.reject(error);
        })

        return defered.promise;
    }
        return self;
})

.factory('ValidateOtpService', function(AffiliationDTO, MENU_RESOURCE, $q, $http){
    var self = this;
    
    self.validateOtp = function(enteredOtp, studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var validateOtpService = "http://"+urlBase + "/rest/gStudentDtls/validateOTP/"+enteredOtp +"/"+ studentId;
        //var validateOtpService = "http://"+urlBase + "/rest/gStudentDtls/validateOTP/"+enteredOtp +"/A14990";
        console.log("ValidateOtpService "+validateOtpService);
        $http.get(validateOtpService).then(function(response) {
            if(response.data["statusOtp"]&&response.data["statusOtp"]==='NOT_VALIDATED') {
                var errorObj = new Object();
                errorObj.error = response.data["statusOtp"];
                console.log(response.data["statusOtp"])
                defered.reject(errorObj);
            }
            else{
                var studentData = [];
                studentData[0] = studentId;
                    defered.resolve(studentData);
                }
            
        }, function(error) {
            console.error(error);
            defered.reject(error);
        })

        return defered.promise;
    }
        return self;
})

.factory('MenuDetailService', function(AffiliationDTO, MENU_RESOURCE, $q, $http){
    var self = this;
    
    self.fetchMenuDetails = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var menuService = "http://"+urlBase + MENU_RESOURCE + studentId;

        $http.get(menuService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }

            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        })

        return defered.promise;
    }

    self.fetchMenuDetails2 = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var menuService = "http://"+urlBase + MENU_RESOURCE + studentId;

        var menuObject = {
            "studentName":"Hardik jain  ",
            "classname":"Vii-A",
            "classTeacher":"Bela  Kakkar ",
            "photo":"http:\/\/www.candoursystems.com\/application\/upload\/LPISKN\/photo\/index.jpg",
            "menuDetails":[
                {
                    "menu_id":"240",
                    "menu_name":"Docs and Syllabus",
                    "url":"getDownloadHeads\/{un}",
                    "mobile_menu_id":"1"
                },
                {
                    "menu_id":"408",
                    "menu_name":"Home Work",
                    "url":"getHWDtls\/{un}\/{hwDate}",
                    "mobile_menu_id":"2"
                },
                {
                    "menu_id":"238",
                    "menu_name":"My Inbox",
                    "url":"getInboxDtls\/{un}\/{initCounter}",
                    "mobile_menu_id":"3"
                },
                {
                    "menu_id":"411",
                    "menu_name":"Time Table",
                    "url":"getTimetable\/{un}",
                    "mobile_menu_id":"4"
                },
                {
                    "menu_id":"998",
                    "menu_name":"PTI",
                    "url":"getPtiDetails\/{un}",
                    "mobile_menu_id":"5"
                },
                {
                    "menu_id":"997",
                    "menu_name":"Attendance",
                    "url":"getAttendanceDtl\/{un}\/{month}",
                    "mobile_menu_id":"6"
                },
                {
                    "menu_id":"995",
                    "menu_name":"Exam Marks",
                    "url":"getExamMarks\/{un}\/{examCode}",
                    "mobile_menu_id":"7"
                },
                {
                    "menu_id":"1996",
                    "menu_name":"Achievements",
                    "url":"getAchievements\/{un}",
                    "mobile_menu_id":"8"
                },
                {
                    "menu_id":"1995",
                    "menu_name":"Discipline",
                    "url":"getStudentDisciplineTckt\/{un}",
                    "mobile_menu_id":"9"
                },
                {
                    "menu_id":"996",
                    "menu_name":"Thought of the day",
                    "url":"getThoughtOfDay\/{un}",
                    "mobile_menu_id":"10"
                },
                {
                    "menu_id":"1999",
                    "menu_name":"Fees",
                    "url":"getFeeDetails\/{un}",
                    "mobile_menu_id":"11"
                },
                {
                    "menu_id":"2000",
                    "menu_name":"School Website",
                    "url":"getSchoolWebsite\/{un}",
                    "mobile_menu_id":"12"
                },
                {
                    "menu_id":"2001",
                    "menu_name":"Location",
                    "url":"getLocationCoordinates\/{un}",
                    "mobile_menu_id":"13"
                },
                {
                    "menu_id":"2002",
                    "menu_name":"Transport",
                    "url":"userTransportDtl\/{un}",
                    "mobile_menu_id":"14"
                },
                {
                    "menu_id":"2003",
                    "menu_name":"Library",
                    "url":"libBookDtl\/{un}",
                    "mobile_menu_id":"15"
                },
                {
                    "menu_id":"2004",
                    "menu_name":"Planner",
                    "url":"getSchoolPlanner\/{monthName}",
                    "mobile_menu_id":"16"
                },
                {
                    "menu_id":"2005",
                    "menu_name":"School News",
                    "url":"getSchoolNews\/{monthName}",
                    "mobile_menu_id":"17"
                },
                {
                    "menu_id":"2006",
                    "menu_name":"Online Feedback",
                    "url":"onlineFeedback\/{un}",
                    "mobile_menu_id":"18"
                }
            ]
        };

        defered.resolve(menuObject);

        return defered.promise;
    }
    
    return self;
})

.factory('TimeTableService', function(AffiliationDTO, $q, $http){

    this.fetchTimeTable = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var timeTableService = "http://"+urlBase + '/rest/gStudentDtls/getTimetable/' + studentId;
        
        $http.get(timeTableService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        })

        return defered.promise;
    };

    return this;

})

.factory('AttendanceService', function(AffiliationDTO, $q, $http){

    this.fetchAttendance = function(studentId, attendanceMonth) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var attendanceService = "http://"+urlBase + '/rest/gStudentDtls/getAttendanceDtl/' + studentId+'/'+attendanceMonth;
        
        $http.get(attendanceService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('NewsEventsService', function(AffiliationDTO, $q, $http){

    this.fetchNewsEvent = function(fetchDate) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var attendanceService = "http://"+urlBase + '/rest/gStudentDtls/getSchoolNews/' + fetchDate;
        
        $http.get(attendanceService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('PlannerService', function(AffiliationDTO, $q, $http){

    this.fetchPlanner = function(fetchDate) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var attendanceService = "http://"+urlBase + '/rest/gStudentDtls/getSchoolPlanner/' + fetchDate;
        
        $http.get(attendanceService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('CalendarDatesFactory', function(){

    this.calendarDates = function(){
        var FebNumberOfDays,
            dateObj = new Date(),
            year = dateObj.getFullYear(),
            startDate = new Date("04-01-"+year),
            startDay = startDate.getDay();

        if ( (year%100!=0) && (year%4==0) || (year%400==0)){
            FebNumberOfDays = 29;
        }else{
            FebNumberOfDays = 28;
        }

        var calendarDatesObj = [],
            monthNames = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov", "Dec", "Jan","Feb","Mar"];
            dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thrusday","Friday", "Saturday"];
            dayPerMonth = ["30","31","30","31","31","30","31","30","31", "31", ""+FebNumberOfDays+"","31"];
            

         for(var i=0; i<monthNames.length; i++){
            var curMonth = {
                monthName :  i < 9 ? monthNames[i]+'-'+year : monthNames[i]+'-'+(year+1),
                days : []
            }
            for(var k= 0; k<parseInt(startDay); k++){
                curMonth.days.push({type:'blank'});
            };
            for(var z=0; z<parseInt(dayPerMonth[i]); z++){
                 curMonth.days.push({
                    dayName:dayNames[startDay],
                    dayNumber: startDay,
                    date: z+1 < 10 ? '0'+(z+1) : z+1
                })
                if(startDay < 6){
                    startDay += 1;
                }else{
                    startDay = 0
                }                
            }
            calendarDatesObj.push(curMonth);
         } 

         return calendarDatesObj;
    };

    return this;

})

.factory('InboxService', function(AffiliationDTO, $q, $http){

    this.fetchInbox = function(studentId, fetchDate, param) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var inboxService = "http://"+urlBase + '/rest/gStudentDtls/getInboxDtls/'+studentId+'/'+param;

        if(fetchDate) inboxService = "http://"+urlBase + '/rest/gStudentDtls/getInboxMsg/'+studentId+'/' + fetchDate;
        
        $http.get(inboxService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('MarksService', function(AffiliationDTO, $q, $http){

    this.fetchExams = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getExamMarks/'+studentId+'/0';
        
        $http.get(examService).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchMarks = function(studentId, examID) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examMarks = "http://"+urlBase + '/rest/gStudentDtls/getExamMarks/'+studentId+'/'+examID;
        $http.get(examMarks).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('AchievementsService', function(AffiliationDTO, $q, $http){

    this.fetchAchievements = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getAchievements/'+studentId;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('DocsAndSyllabusService', function(AffiliationDTO, $q, $http){

    this.fetchDocsAndSyllabusHead = function(type, studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var docsSyllabusHead = "http://"+urlBase + '/rest/gStudentDtls/getDownloadHeads/'+studentId;
        if(type === 'Teacher'){
            docsSyllabusHead = "http://"+urlBase + '/rest/gStudentDtls/getDocListByTeachers/'+studentId;
        }
        $http.get(docsSyllabusHead).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchDocsAndSyllabusDetails = function(type, studentId, documentType) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var docsSyllabusDetails = "http://"+urlBase + '/rest/gStudentDtls/getDownloadDtls/'+studentId+'/'+documentType;
        if(type === 'Teacher'){
            docsSyllabusDetails = "http://"+urlBase + '/rest/gStudentDtls/getDocDtlListTeachers/'+studentId+'/'+documentType;
        }
        $http.get(docsSyllabusDetails).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('GetSchoolWebsiteService', function(AffiliationDTO, $q, $http){

    this.getWebsite = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var docsSyllabusHead = "http://"+urlBase + '/rest/gStudentDtls/getSchoolWebsite/'+studentId;
        
        $http.get(docsSyllabusHead).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;

})

.factory('OnlineFeedbackService', function(AffiliationDTO, $q, $http){

    this.saveFeedback = function(params) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var saveFeedbackService = "http://"+urlBase + '/rest/gStudentDtls/saveFeedback/';
        
        $http.post(saveFeedbackService, params).then(function(response) {
            if(response.data.length == 0) {
                var errorObj = new Object();
                errorObj.error = "No data found for given student id";
                return errorObj;
            }
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;

})

.factory('DisciplineService', function(AffiliationDTO, $q, $http){

    this.getDisciplines = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var disciplineService = "http://"+urlBase + '/rest/gStudentDtls/getStudentDisciplineTckt/'+studentId;
        
        $http.get(disciplineService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;

})

.factory('ThoughtOfTheDayService', function(AffiliationDTO, $q, $http){

    this.fetchThoughtOfTheDay = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var disciplineService = "http://"+urlBase + '/rest/gStudentDtls/getThoughtOfDay/'+studentId;
        
        $http.get(disciplineService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;
})

.factory('HomeworkService', function(AffiliationDTO, $q, $http){

    this.fetchHomework = function(studentId, hwDate) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var disciplineService = "http://"+urlBase + '/rest/gStudentDtls/getHWDtls/'+studentId+'/'+hwDate;
        
        $http.get(disciplineService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;
})

.factory('TeacherAttendenceService', function(AffiliationDTO, $q, $http){

    this.fetchClass = function() {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/classJson';
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchSection = function(classCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/sectionJson/'+classCode;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchStudent = function(classCode, sectionCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/teacherAttendanceSelect/'+classCode+'/'+sectionCode;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.saveAttendance = function(student) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var savingAttendance = "http://"+urlBase + '/rest/gStudentDtls/saveAttendanceList';
        
        $http.post(savingAttendance, student).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('TeacherExamMarksService', function(AffiliationDTO, $q, $http){

    this.fetchClass = function() {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/classJson';
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchSection = function(classCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/sectionJson/'+classCode;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchExamName = function(classCode, sectionCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getExamCombo/'+sectionCode;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchSubjects = function(classCode, sectionCode, examCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getSubjectCombo/'+sectionCode+'/'+examCode;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.searchExams = function(classCode, sectionCode, examNameCode, subjectCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var searchExams = "http://"+urlBase + '/rest/gStudentDtls/getExamActivityList_teacherCiew/'+classCode+'/'+sectionCode+'/'+examNameCode+'/'+subjectCode;
        
        $http.get(searchExams).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.viewResults = function(classCode, sectionCode, examNameCode, subjectCode, examActivityCode, subActivityCode) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var viewResults = "http://"+urlBase + '/rest/gStudentDtls/getExamActivityMarks_teacherCiew/'+classCode+'/'+sectionCode+'/'+examNameCode+'/'+subjectCode+'/'+examActivityCode+'/'+subActivityCode;
        
        $http.get(viewResults).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('DisciplineTeacherService', function(AffiliationDTO, $q, $http){

    this.fetchStudent = function(studentName) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getSearchListStudent/'+studentName;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.viewDiscipline = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getDisciplineDtls_TeacherView/'+studentId;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.getDiscipline = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getDisciplineDtlsForEntry/'+studentId;
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.raiseDiscipline = function(params) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/saveDiscipline';
        
        $http.post(examService, params).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;

})

.factory('DocumentTeacherService', function(AffiliationDTO, $q, $http){

    this.saveDocument = function(studentName, params) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/saveDoc';
        
        $http.post(examService, params).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.fetchDocumentType = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var examService = "http://"+urlBase + '/rest/gStudentDtls/getDocumentTypeCombo';
        
        $http.get(examService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };


    return this;

})

.factory('SchoolLocationService', function(AffiliationDTO, $q, $http){

    this.getLocation = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var locationService = "http://"+urlBase + '/rest/gStudentDtls/getLocationCoordinates/'+studentId;
        
        $http.get(locationService).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    return this;

})

.factory('PTIServices', function(AffiliationDTO, $q, $http){

    this.getPtiDetails = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var ptiDetails = "http://"+urlBase + '/rest/gStudentDtls/getPtiDetails/'+studentId;
        
        $http.get(ptiDetails).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.saveNewPti = function(params) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var ptiDetails = "http://"+urlBase + '/rest/gStudentDtls/savePtiRequest/';
        
        $http.post(ptiDetails, params).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.setPTIData = function(data){
        this.ptiDetails = data;
    }

    this.getPTIData = function(data){
        return this.ptiDetails;
    }

    this.ptiDetails = {};
    return this;

})

.factory('PTITeacherServices', function(AffiliationDTO, $q, $http){

    this.ptiTeacherNewQueryList = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var ptiDetails = "http://"+urlBase + '/rest/gStudentDtls/getNewPTIQueries/'+studentId;
        
        $http.get(ptiDetails).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.savePtiReply = function(params) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var ptiDetails = "http://"+urlBase + '/rest/gStudentDtls/savePTIReplyByTeacher';
        
        $http.post(ptiDetails, params).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.ptiTeacherRepliedQuery = function(studentId) {
        var defered = $q.defer();
        var urlBase = AffiliationDTO.getAffiliationData().ip
        var ptiDetails = "http://"+urlBase + '/rest/gStudentDtls/getPTIRepliedQueries/'+studentId;
        
        $http.get(ptiDetails).then(function(response) {
            defered.resolve(response.data);
        }, function(error) {
            console.error(error);
            defered.reject(error);
        });

        return defered.promise;
    };

    this.setCurQuery = function(data){
        this.queryDetails = data;
    }

    this.getCurQuery = function(data){
        return this.queryDetails;
    }

    this.queryDetails = {};

    return this;

})
.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                });
            });
        }
    }
}])



.directive('fancySelect', 
    [
        '$ionicModal',
        function($ionicModal) {
            return {
                /* Only use as <fancy-select> tag */
                restrict : 'E',

                /* Our template */
                templateUrl: 'fancy-select.html',

                /* Attributes to set */
                scope: {
                    'items'        : '=', /* Items list is mandatory */
                    'text'         : '=', /* Displayed text is mandatory */
                    'value'        : '=', /* Selected value binding is mandatory */
                    'callback'     : '&'
                },

                link: function (scope, element, attrs) {

                    /* Default values */
                    scope.multiSelect   = attrs.multiSelect === 'true' ? true : false;
                    scope.allowEmpty    = attrs.allowEmpty === 'false' ? false : true;

                    /* Header used in ion-header-bar */
                    scope.headerText    = attrs.headerText || '';

                    /* Text displayed on label */
                    // scope.text          = attrs.text || '';
                    scope.defaultText   = scope.text || '';

                    /* Notes in the right side of the label */
                    scope.noteText      = attrs.noteText || '';
                    scope.noteImg       = attrs.noteImg || '';
                    scope.noteImgClass  = attrs.noteImgClass || '';
                    
                    /* Optionnal callback function */
                    // scope.callback = attrs.callback || null;

                    /* Instanciate ionic modal view and set params */

                    /* Some additionnal notes here : 
                     * 
                     * In previous version of the directive,
                     * we were using attrs.parentSelector
                     * to open the modal box within a selector. 
                     * 
                     * This is handy in particular when opening
                     * the "fancy select" from the right pane of
                     * a side view. 
                     * 
                     * But the problem is that I had to edit ionic.bundle.js
                     * and the modal component each time ionic team
                     * make an update of the FW.
                     * 
                     * Also, seems that animations do not work 
                     * anymore.
                     * 
                     */
                    $ionicModal.fromTemplateUrl(
                        'fancy-select-items.html',
                          {'scope': scope}
                    ).then(function(modal) {
                        scope.modal = modal;
                    });

                    /* Validate selection from header bar */
                    scope.validate = function (event) {
                        // Construct selected values and selected text
                        if (scope.multiSelect == true) {

                            // Clear values
                            scope.value = '';
                            scope.text = '';

                            // Loop on items
                            jQuery.each(scope.items, function (index, item) {
                                if (item.checked) {
                                    scope.value = scope.value + item.id+';';
                                    scope.text = scope.text + item.text+', ';
                                }
                            });

                            // Remove trailing comma
                            scope.value = scope.value.substr(0,scope.value.length - 1);
                            scope.text = scope.text.substr(0,scope.text.length - 2);
                        }

                        // Select first value if not nullable
                        if (typeof scope.value == 'undefined' || scope.value == '' || scope.value == null ) {
                            if (scope.allowEmpty == false) {
                                scope.value = scope.items[0].id;
                                scope.text = scope.items[0].text;

                                // Check for multi select
                                scope.items[0].checked = true;
                            } else {
                                scope.text = scope.defaultText;
                            }
                        }

                        // Hide modal
                        scope.hideItems();
                        
                        // Execute callback function
                        if (typeof scope.callback == 'function') {
                            scope.callback (scope.value);
                        }
                    }

                    /* Show list */
                    scope.showItems = function (event) {
                        event.preventDefault();
                        scope.modal.show();
                    }

                    /* Hide list */
                    scope.hideItems = function () {
                        scope.modal.hide();
                    }

                    /* Destroy modal */
                    scope.$on('$destroy', function() {
                      scope.modal.remove();
                    });

                    /* Validate single with data */
                    scope.validateSingle = function (item) {

                        // Set selected text
                        scope.text = item.text;

                        // Set selected value
                        scope.value = item.id;

                        // Hide items
                        scope.hideItems();
                        
                        // Execute callback function
                        if (typeof scope.callback == 'function') {
                            scope.callback (scope.value);
                        }
                    }
                }
            };
        }
    ]
)

.factory('GetSchoolInfo', function(){

    this.setSchoolInfo = function(data){
        this.schoolInfo = data;
    }

    this.getSchoolInfo = function(){
        return this.schoolInfo;
    }

    this.schoolInfo = {};

    return this;

})

.directive("footerDirective", function($timeout, GetSchoolInfo) {
    return {
        restrict : "E",
        template : "<ion-footer-bar><div class='copyRight' ng-if='school_link'><a href={{school_link}} target='blank'><img src={{school_logo}} style='height:41px'></a></div><div class='poweredBy'><a href='http://www.candoursystems.com/' target='blank'> <img src='img/logo-candourSystems.png' style='height:41px'> </a></div></ion-footer-bar>",
        link: function(scope,elem, attr){
            $timeout(function(){
                console.log(GetSchoolInfo.getSchoolInfo().clientWebSite);
                scope.school_link = GetSchoolInfo.getSchoolInfo().clientWebSite;
                scope.school_logo = "http://"+GetSchoolInfo.getSchoolInfo().clientFooterLogo;
            },500);
        }
    };
})

.directive("footercDirective", function($timeout, GetSchoolInfo) {
    return {
        restrict : "E",
        template : "<ion-footer-bar><div class='poweredBy'><a href='http://www.candoursystems.com/' target='blank'> <img src='img/logo-candourSystems.png' style='height:41px'> </a></div></ion-footer-bar>",
        link: function(scope,elem, attr){
            $timeout(function(){
                scope.school_link = GetSchoolInfo.getSchoolInfo().clientWebSite;
                scope.school_logo = "http://"+GetSchoolInfo.getSchoolInfo().clientFooterLogo;
            },100);
        }
    };
});