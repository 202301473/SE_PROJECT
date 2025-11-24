# Test Execution Guide - Lawyer Verification System

## Quick Start Guide

### Prerequisites
1. Backend server running on `http://localhost:8000`
2. Frontend server running on `http://localhost:5174` (or current port)
3. Admin/superuser account created
4. Test lawyer accounts created with various statuses

---

## Step-by-Step Test Execution

### Phase 1: Access Control Tests (Priority 1)

#### TC-AC-1: Unauthorized Access (Non-Admin)
1. Log in as a regular user (client or lawyer)
2. Navigate to `/admin/lawyer-verification`
3. **Expected**: Redirected to home page, error toast: "Access denied. Admin only."
4. **Result**: ⬜ Pass / ❌ Fail
5. **Notes**: ________________

#### TC-AC-2: Unauthenticated Access
1. Log out (or use incognito mode)
2. Navigate to `/admin/lawyer-verification`
3. **Expected**: Redirected to `/login`
4. **Result**: ⬜ Pass / ❌ Fail
5. **Notes**: ________________

#### TC-AC-3: Admin Access
1. Log in as admin/superuser
2. Navigate to `/admin/lawyer-verification`
3. **Expected**: Page loads, lawyer list displayed
4. **Result**: ⬜ Pass / ❌ Fail
5. **Notes**: ________________

---

### Phase 2: List Display Tests (Priority 2)

#### TC-LIST-1: Display Pending Lawyers
1. Click "Pending" tab
2. **Expected**: Shows all lawyers with status "pending", count badge shows correct number
3. **Result**: ⬜ Pass / ❌ Fail
4. **Notes**: ________________

#### TC-LIST-2: Display Approved Lawyers
1. Click "Approved" tab
2. **Expected**: Shows all lawyers with status "approved", count badge shows correct number
3. **Result**: ⬜ Pass / ❌ Fail
4. **Notes**: ________________

#### TC-LIST-3: Display Rejected Lawyers
1. Click "Rejected" tab
2. **Expected**: Shows all lawyers with status "rejected", count badge shows correct number
3. **Result**: ⬜ Pass / ❌ Fail
4. **Notes**: ________________

---

### Phase 3: Search Functionality Tests (Priority 2)

#### TC-SEARCH-1: Search by Email
1. Enter email in search box: `lawyer@example.com`
2. **Expected**: Shows only lawyers matching the email
3. **Result**: ⬜ Pass / ❌ Fail
4. **Notes**: ________________

#### TC-SEARCH-2: Search by Name
1. Enter name in search box: `John Doe`
2. **Expected**: Shows only lawyers with matching name
3. **Result**: ⬜ Pass / ❌ Fail
4. **Notes**: ________________

#### TC-SEARCH-5: Search with No Results
1. Enter non-existent term: `nonexistent123`
2. **Expected**: Shows empty state, no lawyers displayed
3. **Result**: ⬜ Pass / ❌ Fail
4. **Notes**: ________________

---

### Phase 4: Verification Tests (Priority 1)

#### TC-VERIFY-1: Approve Lawyer (No Notes)
1. Go to "Pending" tab
2. Find a pending lawyer
3. Click "Approve" button (leave notes empty)
4. **Expected**: 
   - Status changes to "approved"
   - Success toast appears
   - Lawyer moves to "Approved" tab
   - Count badges update
5. **Result**: ⬜ Pass / ❌ Fail
6. **Notes**: ________________

#### TC-VERIFY-2: Approve Lawyer (With Notes)
1. Go to "Pending" tab
2. Find a pending lawyer
3. Enter notes: "All documents verified"
4. Click "Approve" button
5. **Expected**: 
   - Status changes to "approved"
   - Notes saved and displayed
   - Success toast appears
6. **Result**: ⬜ Pass / ❌ Fail
7. **Notes**: ________________

#### TC-REJECT-1: Reject Lawyer (No Notes)
1. Go to "Pending" tab
2. Find a pending lawyer
3. Click "Reject" button (leave notes empty)
4. **Expected**: 
   - Status changes to "rejected"
   - Success toast appears
   - Lawyer moves to "Rejected" tab
5. **Result**: ⬜ Pass / ❌ Fail
6. **Notes**: ________________

#### TC-REJECT-2: Reject Lawyer (With Notes)
1. Go to "Pending" tab
2. Find a pending lawyer
3. Enter notes: "Missing license documents"
4. Click "Reject" button
5. **Expected**: 
   - Status changes to "rejected"
   - Notes saved and displayed
   - Success toast appears
6. **Result**: ⬜ Pass / ❌ Fail
7. **Notes**: ________________

---

### Phase 5: Error Handling Tests (Priority 1)

#### TC-ERROR-1: Network Error During Load
1. Stop backend server
2. Refresh the page
3. **Expected**: Error message displayed, "Unable to load lawyers" toast
4. **Result**: ⬜ Pass / ❌ Fail
5. **Notes**: ________________

#### TC-ERROR-2: Network Error During Verify
1. Start backend server
2. Load page successfully
3. Stop backend server
4. Try to approve a lawyer
5. **Expected**: Error toast: "Unable to verify lawyer", Status unchanged
6. **Result**: ⬜ Pass / ❌ Fail
7. **Notes**: ________________

---

## Test Results Summary Template

```
Test Execution Date: ___________
Tester Name: ___________
Environment: ___________

Total Test Cases: 42
Passed: ___
Failed: ___
Not Executed: ___
Pass Rate: ___%

Critical Issues Found: ___
High Priority Issues: ___
Medium Priority Issues: ___
Low Priority Issues: ___
```

---

## Bug Report Template

```
Bug ID: BUG-001
Test Case: TC-VERIFY-1
Severity: High/Medium/Low
Priority: P1/P2/P3/P4

Description:
[Describe the bug]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots:
[Attach if applicable]

Environment:
- Browser: 
- OS: 
- Backend Version: 
- Frontend Version: 
```

---

## Automated Test Script

To run automated tests (if Jest/React Testing Library is set up):

```bash
cd SE_PROJECT/frontend
npm test -- AdminLawyerVerification.test.js
```

---

## Test Data Requirements

### Required Test Lawyers:
1. **Pending Lawyer 1**: 
   - Email: pending1@test.com
   - Status: pending
   - Complete profile

2. **Pending Lawyer 2**: 
   - Email: pending2@test.com
   - Status: pending
   - Missing optional fields

3. **Approved Lawyer**: 
   - Email: approved@test.com
   - Status: approved

4. **Rejected Lawyer**: 
   - Email: rejected@test.com
   - Status: rejected

### Test Admin Account:
- Email: admin@test.com
- Role: admin or is_superuser: true
- Password: [secure password]

---

## Quick Test Checklist

Use this checklist for quick smoke testing:

- [ ] Admin can access page
- [ ] Non-admin cannot access
- [ ] Pending tab shows pending lawyers
- [ ] Search works by email
- [ ] Approve button works
- [ ] Reject button works
- [ ] Notes are saved
- [ ] Status badges update correctly
- [ ] Error handling works when backend is down

---

## Notes
- Execute tests in order of priority
- Document all failures with screenshots
- Re-test after bug fixes
- Update coverage report after each test session

