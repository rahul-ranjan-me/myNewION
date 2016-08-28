angular.module('aes.configs', [])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('root', {
    url: '/',
    templateUrl: 'templates/start.htm',
    controller: 'rootController'
  })

  .state('nonAffiliated', {
    url: '/non-affiliated',
    templateUrl: 'templates/affiliation-form.htm',
    controller: 'affiliationController'
  })
  
  .state('affiliated', {
    url: '/affiliated',
    templateUrl: 'templates/affiliated.htm',
    controller: 'successController'

  })

  .state('studentIdValidate', {
    url: '/studentIdValidate',
    //abstract: true,
    templateUrl: 'templates/studentIdValidation.htm',
    controller: 'StudentIdController'
  })

  .state('enterOtp', {
    url: '/enterOtp',
    //abstract: true,
    templateUrl: 'templates/otpEnter.htm',
    controller: 'otpEnterController'
  })
  
  .state('menu', {
    url: '/menu',
    abstract: true,
    templateUrl: 'templates/menu.htm',
    controller: 'MenuController'
  })

  .state('menu.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.htm',
        controller: 'HomeController'
      }
    }
  })
  
  .state('menu.docsAndSyllabus', {
    url: '/docs-syllabus',
    params: {
        url: null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/docsAndSyllabus.htm',
        controller: 'DocsAndSyllabusController'
      }
    }
  })
  
  .state('menu.timeTable', {
    url: '/time-table',
    views: {
      'menuContent': {
        templateUrl: 'templates/timeTable.htm',
        controller: 'TimeTableController'
      }
    }
  })

  .state('menu.attendance', {
    url: '/attendance',
    views: {
      'menuContent': {
        templateUrl: 'templates/attendance.htm',
        controller: 'AttendanceController'
      }
    }
  })

  .state('menu.newsEvents', {
    url: '/news-events',
    views: {
      'menuContent': {
        templateUrl: 'templates/newsEvents.htm',
        controller: 'NewsEventsController'
      }
    }
  })

  .state('menu.planner', {
    url: '/planner',
    views: {
      'menuContent': {
        templateUrl: 'templates/planner.htm',
        controller: 'PlannerController'
      }
    }
  })

  .state('menu.inbox', {
    url: '/inbox',
    views: {
      'menuContent': {
        templateUrl: 'templates/inbox.htm',
        controller: 'InboxController'
      }
    }
  })

  .state('menu.homework', {
    url: '/homework',
    views: {
      'menuContent': {
        templateUrl: 'templates/homework.htm',
        controller: 'HomeworkController'
      }
    }
  })

  .state('menu.marks', {
    url: '/marks',
    views: {
      'menuContent': {
        templateUrl: 'templates/marks.htm',
        controller: 'MarksController'
      }
    }
  }) 

  .state('menu.examsMarks', {
    url: '/examsMarks/:examId',
    views: {
      'menuContent': {
        templateUrl: 'templates/examMarks.htm',
        controller: 'ExamMarksController'
      }
    }
  })  

  .state('menu.achievements', {
    url: '/achievements',
    views: {
      'menuContent': {
        templateUrl: 'templates/achievements.htm',
        controller: 'AchievementsController'
      }
    }
  })

  .state('menu.dicipline', {
    url: '/dicipline',
    views: {
      'menuContent': {
        templateUrl: 'templates/dicipline.htm',
        controller: 'DisciplineController'
      }
    }
  })

  .state('menu.onlineFeedback', {
    url: '/onlineFeedback',
    views: {
      'menuContent': {
        templateUrl: 'templates/onlineFeedback.htm',
        controller: 'OnlineFeedbackController'
      }
    }
  })
  
  .state('menu.thoughtOfTheDay', {
    url: '/thought-of-the-day',
    views: {
      'menuContent': {
        templateUrl: 'templates/thoughtOfTheDay.htm',
        controller: 'ThoughtOfTheDayController'
      }
    }
  })

  .state('menu.teacherAttendence', {
    url: '/teacherAttendanceSelect',
    views: {
      'menuContent': {
        templateUrl: 'templates/teacherAttendence.htm',
        controller: 'TeacherAttendanceController'
      }
    }
  })

  .state('menu.markAttendance', {
    url: '/mark-attendence/:class/:section',
    views: {
      'menuContent': {
        templateUrl: 'templates/teacherMarkAttendence.htm',
        controller: 'TeacherMarkAttendanceController'
      }
    }
  })

  .state('menu.getExamActivityMarks', {
    url: '/getExamActivityMarks',
    views: {
      'menuContent': {
        templateUrl: 'templates/teacherExamMarks.htm',
        controller: 'TeacherExamMarksController'
      }
    }
  })

  .state('menu.getExamSubject', {
    url: '/getExamSubject/:classCode/:sectionCode/:examCode/:subjectCode',
    views: {
      'menuContent': {
        templateUrl: 'templates/teacherExamSubject.htm',
        controller: 'TeacherExamSubjectController'
      }
    }
  })

  .state('menu.viewExamResult', {
    url: '/viewExamResult/:classCode/:sectionCode/:examCode/:subjectCode/:examActivityCode/:subActivityCode',
    views: {
      'menuContent': {
        templateUrl: 'templates/viewExamResult.htm',
        controller: 'TeacherViewResultController'
      }
    }
  })

  .state('menu.disciplineTeacher', {
    url: '/disciplineTeacher',
    views: {
      'menuContent': {
        templateUrl: 'templates/searchDiscipline.htm',
        controller: 'SearchDisciplineController'
      }
    }
  })

  .state('menu.viewDiscipline', {
    url: '/viewDiscipline/:studentId/:studentName',
    views: {
      'menuContent': {
        templateUrl: 'templates/viewDiscipline.htm',
        controller: 'ViewDisciplineController'
      }
    }
  })

  .state('menu.entryDiscipline', {
    url: '/raiseDiscipline/:studentId/:studentName',
    views: {
      'menuContent': {
        templateUrl: 'templates/entryDiscipline.htm',
        controller: 'EntryDisciplineController'
      }
    }
  })

  .state('menu.replyDiscipline', {
    url: '/replyDiscipline',
    views: {
      'menuContent': {
        templateUrl: 'templates/replyDiscipline.htm',
        controller: 'ReplyDisciplineController'
      }
    }
  })

  .state('menu.getDocListByTeachers', {
    url: '/getDocListByTeachers',
    views: {
      'menuContent': {
        templateUrl: 'templates/getDocListByTeachers.htm',
        controller: 'uploadDocsMainController'
      }
    }
  })

  .state('menu.selectDocsTeacher', {
    url: '/selectDocsTeacher',
    views: {
      'menuContent': {
        templateUrl: 'templates/selectDocsTeacher.htm',
        controller: 'selectDocsTeacherController'
      }
    }
  })

  .state('menu.uploadDocsTeacher', {
    url: '/uploadDocsTeacher',
    views: {
      'menuContent': {
        templateUrl: 'templates/uploadDocsTeacher.htm',
        controller: 'uploadDocsTeacherController'
      }
    }
  })

  .state('menu.pti', {
    url: '/pti',
    views: {
      'menuContent': {
        templateUrl: 'templates/pti.htm',
        controller: 'ptiController'
      }
    }
  })

  .state('menu.ptiDetails', {
    url: '/ptiDetails/:teacherID',
    views: {
      'menuContent': {
        templateUrl: 'templates/ptiDetails.htm',
        controller: 'ptiDetailsController'
      }
    }
  })

  .state('menu.ptiNew', {
    url: '/ptiNew',
    views: {
      'menuContent': {
        templateUrl: 'templates/ptiNew.htm',
        controller: 'ptiNewController'
      }
    }
  })

  .state('menu.location', {
    url: '/location',
    views: {
      'menuContent': {
        templateUrl: 'templates/location.htm',
        controller: 'locationController'
      }
    }
  })

  .state('menu.getNewPTIQueries', {
    url: '/getNewPTIQueries',
    views: {
      'menuContent': {
        templateUrl: 'templates/ptiTeacher.htm',
        controller: 'ptiTeacherController'
      }
    }
  })

  .state('menu.ptiTeacherNewQueryList', {
    url: '/getNewPTINewQueries',
    views: {
      'menuContent': {
        templateUrl: 'templates/ptiTeacherNewList.htm',
        controller: 'ptiTeacherNewQueryList'
      }
    }
  })

  .state('menu.ptiTeacherRespondQueryList', {
    url: '/savePTIReplyByTeacher',
    views: {
      'menuContent': {
        templateUrl: 'templates/ptiTeacherRespondQueryList.htm',
        controller: 'ptiTeacherRespondQueryList'
      }
    }
  })

  .state('menu.ptiTeacherRepliedQuery', {
    url: '/getPTIRepliedQueries',
    views: {
      'menuContent': {
        templateUrl: 'templates/ptiTeacherRepliedQuery.htm',
        controller: 'ptiTeacherRepliedQuery'
      }
    }
  })
  $urlRouterProvider.otherwise('/');
})
