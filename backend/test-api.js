/**
 * Automated REST API Test Suite for Dark Mode Task Dashboard Backend
 * Verifies all 7 test categories specified in Requirement 21
 */

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  let passedCount = 0;
  let totalCount = 0;

  const assert = (condition, name, details = '') => {
    totalCount++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] ${name}: ${details}`);
    }
  };

  console.log('\n=========================================');
  console.log('🧪 Starting Backend API Automated Tests');
  console.log('=========================================\n');

  try {
    // -------------------------------------------------------------
    // Test 1: GET /api/health
    // -------------------------------------------------------------
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(
      healthRes.status === 200 && healthData.success === true && healthData.message === 'Backend is running',
      '1. GET /api/health returns 200 OK and message',
      JSON.stringify(healthData)
    );

    // -------------------------------------------------------------
    // Test 2: POST /api/tasks
    // -------------------------------------------------------------
    // 2a. Empty title validation
    const emptyTitleRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '   ', description: 'Some description' })
    });
    const emptyTitleData = await emptyTitleRes.json();
    assert(
      emptyTitleRes.status === 400 && emptyTitleData.success === false,
      '2a. POST /api/tasks with empty title returns 400 Bad Request',
      JSON.stringify(emptyTitleData)
    );

    // 2b. Empty description validation
    const emptyDescRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Valid Title', description: '' })
    });
    const emptyDescData = await emptyDescRes.json();
    assert(
      emptyDescRes.status === 400 && emptyDescData.success === false,
      '2b. POST /api/tasks with empty description returns 400 Bad Request',
      JSON.stringify(emptyDescData)
    );

    // 2c. Valid task creation
    const createRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'backend.txt',
        description: 'Backend development notes and architectural tests.'
      })
    });
    const createData = await createRes.json();
    assert(
      createRes.status === 201 && createData.success === true && createData.task && createData.task._id,
      '2c. POST /api/tasks creates valid task with 201 Created and returns object',
      JSON.stringify(createData)
    );
    const createdTaskId = createData.task ? createData.task._id : null;

    // -------------------------------------------------------------
    // Test 3: GET /api/tasks
    // -------------------------------------------------------------
    const getAllRes = await fetch(`${BASE_URL}/tasks`);
    const getAllData = await getAllRes.json();
    assert(
      getAllRes.status === 200 && getAllData.success === true && Array.isArray(getAllData.tasks) && getAllData.count >= 1,
      '3. GET /api/tasks returns all tasks array with count',
      `Count: ${getAllData.count}`
    );

    // -------------------------------------------------------------
    // Test 4: GET /api/tasks/:id
    // -------------------------------------------------------------
    // 4a. Valid ID
    const getSingleRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`);
    const getSingleData = await getSingleRes.json();
    assert(
      getSingleRes.status === 200 && getSingleData.success === true && getSingleData.task._id === createdTaskId,
      '4a. GET /api/tasks/:id returns correct task for valid ID',
      JSON.stringify(getSingleData)
    );

    // 4b. Invalid ID format
    const invalidIdRes = await fetch(`${BASE_URL}/tasks/invalid-123-xyz`);
    const invalidIdData = await invalidIdRes.json();
    assert(
      invalidIdRes.status === 400 && invalidIdData.success === false,
      '4b. GET /api/tasks/:id returns 400 for invalid ID format',
      JSON.stringify(invalidIdData)
    );

    // 4c. Non-existent valid ObjectId
    const nonExistentId = '507f1f77bcf86cd799439011';
    const notFoundRes = await fetch(`${BASE_URL}/tasks/${nonExistentId}`);
    const notFoundData = await notFoundRes.json();
    assert(
      notFoundRes.status === 404 && notFoundData.success === false && notFoundData.message === 'Task not found',
      '4c. GET /api/tasks/:id returns 404 for non-existent ID',
      JSON.stringify(notFoundData)
    );

    // -------------------------------------------------------------
    // Test 5: PUT /api/tasks/:id
    // -------------------------------------------------------------
    const updateRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'updated_backend.txt',
        description: 'Updated backend notes content.'
      })
    });
    const updateData = await updateRes.json();
    assert(
      updateRes.status === 200 && updateData.success === true && updateData.task.title === 'updated_backend.txt',
      '5. PUT /api/tasks/:id updates task and returns updated document',
      JSON.stringify(updateData)
    );

    // -------------------------------------------------------------
    // Test 6: DELETE /api/tasks/:id
    // -------------------------------------------------------------
    const deleteRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    assert(
      deleteRes.status === 200 && deleteData.success === true && deleteData.message === 'Task deleted successfully',
      '6. DELETE /api/tasks/:id deletes task with 200 OK',
      JSON.stringify(deleteData)
    );

    // -------------------------------------------------------------
    // Test 7: GET /api/tasks after deletion
    // -------------------------------------------------------------
    const verifyGetSingleRes = await fetch(`${BASE_URL}/tasks/${createdTaskId}`);
    assert(
      verifyGetSingleRes.status === 404,
      '7. GET /api/tasks/:id after deletion returns 404 Not Found'
    );

    console.log('\n=========================================');
    console.log(`🎉 TEST SUMMARY: ${passedCount}/${totalCount} tests passed!`);
    console.log('=========================================\n');

    process.exitCode = passedCount === totalCount ? 0 : 1;
    return;
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  }
};

runTests();
