angular.module('aes.constants', [])
.constant('DB_CONFIG', {
    name: 'aes-db',
    tables: [{
        name: 'affiliation',
        columns: [{
            name: 'affiliationCode', 
            type: 'INTEGER PRIMARY KEY'
        }, {
            name: 'schoolName', 
            type: 'VARCHAR(50)',

        }, {
            name: 'schoolAddress', 
            type: 'VARCHAR(250)',
            
        }, {
            name: 'school_logo', 
            type: 'VARCHAR(250)',
            
        }, {
            name: 'ip', 
            type: 'VARCHAR(250)',
            
        }]
    },
    {
        name: 'savedstudentid',
        columns: [{
            name: 'studentId', 
            type: 'VARCHAR(50) PRIMARY KEY'
        }]
    }]
})
.constant('AFFILIATION_SERVICE_URL',
    'http://schoolerp.co.in:8085/CandourApps/rest/gClientDtls/cDtls/')
.constant('RESOURCE_ROOT', '/rest/gStudentDtls/')
.constant('MENU_RESOURCE', '/rest/gStudentDtls/getMenuDtls/')
.constant('MENU_ITEM_MASTER', {
    "1":{
        title: 'Docs And Syllabus',
        path: 'docs-syllabus',
        icon: 'Document&Syllabus.fw.png'
    },
    "2":{
        title: 'Home Work',
        path: 'homework',
        icon: 'HomeWork_2.fw.png'
    },
    "3":{
        title: 'My Inbox',
        path: 'inbox',
        icon: 'InBox.fw.png'
    },
    "4":{
        title: 'Time Table',
        path: 'time-table',
        icon: 'TimeTable.fw.png'
    },
    "5":{
        title: 'PTI',
        path: 'pti',
        icon: 'ParentTeacherInteraction_1.fw.png'
    },
    "6":{
        title: 'Student Att. Report',
        path: 'attendance',
        icon: 'Attendance_1.fw.png'
    },
    "7":{
        title: 'Exam Marks',
        path: 'marks',
        icon: 'ExamMarks.fw.png'
    },
    "8":{
        title: 'Achievements',
        path: 'achievements',
        icon: 'Achievements.fw.png'
    },
    "9":{
        title: 'Discipline',
        path: 'dicipline',
        icon: 'Discipline_1.fw.png'
    },
    "10":{
        title: 'Thought Of The Day',
        path: 'thought-of-the-day',
        icon: 'ThoughtOdTheDay.fw.png'
    },
    "11":{},
    "12":{},
    "13":{},
    "14":{},
    "15":{},
    "16":{
        title: 'Planner',
        path: 'planner',
        icon: 'Circular.fw.png'
    },
    "17":{
        title: 'News & Events',
        path: 'news-events',
        icon: 'News.fw.png'
    },
    "18":{
        title: 'Feedback',
        path: 'onlineFeedback',
        icon: 'Result_2.fw.png'
    },
    "19":{
        title: 'Upload Document',
        path: 'getDocListByTeachers',
        icon: 'Circular.fw.png'
    },
    "20":{
        title: 'Teacher Attendance',
        path: 'teacherAttendanceSelect',
        icon: 'Attendence.fw.png'
    },
    "21":{
        title: 'Exam detail sheet',
        path: 'getExamActivityMarks',
        icon: 'Result.fw.png'
    },
    "22":{
        title: 'Discipline Master',
        path: 'disciplineTeacher',
        icon: 'Discipline.fw.png'
    },
    "23":{
        title: 'PTI',
        path: 'getNewPTIQueries',
        icon: 'ParentTeacherInteraction_1.fw.png'
    }

});
