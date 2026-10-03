/**
 * Automated Verification Script for TaskFlow Application
 */
const http = require('http');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Start the app in a child process or import it
const app = require('./app');

const TEST_PORT = 3055;
const server = app.listen(TEST_PORT, async () => {
  console.log(`[Test Runner] Testing TaskFlow on port ${TEST_PORT}...`);

  function request(options, postData = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }

  try {
    // 1. Test GET /
    console.log('1. Testing GET / (Homepage)...');
    const resHome = await request({ hostname: 'localhost', port: TEST_PORT, path: '/', method: 'GET' });
    console.assert(resHome.status === 200, `Expected status 200, got ${resHome.status}`);
    console.assert(resHome.body.includes('TaskFlow'), 'Page should contain "TaskFlow"');
    console.assert(resHome.body.includes('Add New Task'), 'Page should contain "Add New Task" button');
    console.assert(resHome.body.includes('Read More'), 'Page should contain "Read More" button');
    console.log('   ✅ Homepage test passed.');

    // 2. Test GET /create
    console.log('2. Testing GET /create (Create Form)...');
    const resCreateForm = await request({ hostname: 'localhost', port: TEST_PORT, path: '/create', method: 'GET' });
    console.assert(resCreateForm.status === 200, `Expected status 200, got ${resCreateForm.status}`);
    console.assert(resCreateForm.body.includes('<form action="/create" method="POST"'), 'Page should have form pointing to /create');
    console.assert(resCreateForm.body.includes('Task Title'), 'Form should have Task Title');
    console.assert(resCreateForm.body.includes('Task Description'), 'Form should have Task Description');
    console.log('   ✅ Create form test passed.');

    // 3. Test POST /create (Empty inputs rejected)
    console.log('3. Testing POST /create with empty inputs...');
    const emptyPostData = querystring.stringify({ title: '   ', description: '' });
    const resEmptyPost = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(emptyPostData)
      }
    }, emptyPostData);
    console.assert(resEmptyPost.status === 302, `Expected 302 redirect, got ${resEmptyPost.status}`);
    console.assert(resEmptyPost.headers.location.includes('error=empty'), 'Should redirect to error=empty');
    console.log('   ✅ Validation rejection test passed.');

    // 4. Test POST /create (Valid inputs)
    console.log('4. Testing POST /create with valid inputs...');
    const validPostData = querystring.stringify({
      title: 'Automated Test Task Title',
      description: 'This is a description written by the automated test runner to verify file system persistence.'
    });
    const resValidPost = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(validPostData)
      }
    }, validPostData);
    console.assert(resValidPost.status === 302, `Expected 302 redirect, got ${resValidPost.status}`);
    console.assert(resValidPost.headers.location.includes('success=created'), 'Should redirect with success=created');
    console.log('   ✅ Task creation & redirect test passed.');

    // Check that file actually exists in tasks/
    const files = fs.readdirSync(path.join(__dirname, 'tasks'));
    const createdFile = files.find(f => f.startsWith('automated-test-task-title'));
    console.assert(!!createdFile, 'Created task file must exist on disk in tasks/');
    console.log(`   ✅ Verified task file created: ${createdFile}`);

    // 5. Test GET /task/:filename
    console.log('5. Testing GET /task/:filename...');
    const resTaskDetails = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: `/task/${encodeURIComponent(createdFile)}`,
      method: 'GET'
    });
    console.assert(resTaskDetails.status === 200, `Expected status 200, got ${resTaskDetails.status}`);
    console.assert(resTaskDetails.body.includes('Automated Test Task Title'), 'Details page must include title');
    console.assert(resTaskDetails.body.includes('Back to Tasks'), 'Details page must have "Back to Tasks" button');
    console.log('   ✅ Task details test passed.');

    // 6. Test Security: Directory traversal prevention
    console.log('6. Testing security against directory traversal...');
    const resTraversal = await request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/task/..%2F..%2Fpackage.json',
      method: 'GET'
    });
    console.assert(resTraversal.status === 302, 'Traversal should be rejected with 302 redirect');
    console.assert(resTraversal.headers.location.includes('error=invalid'), 'Traversal should redirect to error=invalid');
    console.log('   ✅ Directory traversal security test passed.');

    // 7. Cleanup created test file
    fs.unlinkSync(path.join(__dirname, 'tasks', createdFile));
    console.log('   ✅ Cleaned up temporary test file.');

    console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
});
