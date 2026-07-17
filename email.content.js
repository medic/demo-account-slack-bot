const email_subject = "Your Community Health App Demo";
const email_body = `
<div>
    Welcome to the Community Health Toolkit! To view your personal demo of a community 
    health app built with the 
    <a href="https://docs.communityhealthtoolkit.org/technical-overview/architecture/cht-core/">Core Framework</a>, 
    use the information below. After your first login, you will have to change
    your password. (<b>Note</b>: the CHT only works in Chrome or Firefox) 
</div>
<br>
<div style="padding-left: 20px">
    Click to go to the <a href="https://MEDIC_INSTANCE">CHT Demo Server</a> and use these credentials:<br> 
    Username: <span style="font-family: monospace;">USER_NAME</span><br> 
    Password: <span style="font-family: monospace;">USER_PASSWORD</span>
</div>
<br>
<div>
    It may take up to a minute for the app to load demo data, including sample families, 
    people, history, and tasks. Once the tasks have populated, the app can run offline. 
    Please note that the clinical protocols and guidance in the app are for demo purposes 
    only. To explore tablet and mobile views, simply decrease the size of your browser 
    window. 
</div>
<br>
<div>
    To view the code behind this demo instance, be sure to visit the 
    <a href="https://github.com/medic/cht-core/tree/master/config/demo">GitHub CHT Demo repository</a>. App developers
    looking to get started with their own local instance of the CHT can
    easily jump in with the 
    <a href="https://docs.communityhealthtoolkit.org/hosting/cht/app-developer/#cht-docker-helper">CHT Docker Helper</a>. 
</div>
<br>
<div>
    <b>Join our <a href="https://forum.communityhealthtoolkit.org/">community forum</a></b> 
    to learn more about the CHT, ask us any  questions, or tell us about your project!
</div>
<br>
<div>
    Community Health Toolkit <br> 
    <a href="https://communityhealthtoolkit.org">communityhealthtoolkit.org</a>
</div><br>
`;

exports.email_subject = email_subject;
exports.email_body = email_body;