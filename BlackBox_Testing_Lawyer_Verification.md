# Black Box Testing - Lawyer Verification System

## Test Document for Admin Lawyer Verification Page

### Test Environment
- **Page URL**: `/admin/lawyer-verification`
- **Access Level**: Admin/Superuser Only
- **Browser**: Chrome, Firefox, Edge (Latest versions)

---

## 1. Access Control Testing

### Test Case TC-AC-1: Unauthorized Access (Non-Admin User)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-AC-1 | Non-admin user tries to access verification page | User role: "client" or "lawyer" | Redirected to home page, Error toast: "Access denied. Admin only." |

### Test Case TC-AC-2: Unauthenticated Access
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-AC-2 | Unauthenticated user tries to access page | No login session | Redirected to login page |

### Test Case TC-AC-3: Admin Access
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-AC-3 | Admin user accesses verification page | User role: "admin" or is_superuser: true | Page loads successfully, shows lawyer list |

---

## 2. Lawyer List Display Testing

### Test Case TC-LIST-1: Display Pending Lawyers
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-LIST-1 | View pending lawyers tab | Click "Pending" tab | Shows all lawyers with status "pending", Count badge shows correct number |

### Test Case TC-LIST-2: Display Approved Lawyers
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-LIST-2 | View approved lawyers tab | Click "Approved" tab | Shows all lawyers with status "approved", Count badge shows correct number |

### Test Case TC-LIST-3: Display Rejected Lawyers
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-LIST-3 | View rejected lawyers tab | Click "Rejected" tab | Shows all lawyers with status "rejected", Count badge shows correct number |

### Test Case TC-LIST-4: Display All Lawyers
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-LIST-4 | View all lawyers tab | Click "All" tab | Shows all lawyers regardless of status, All status badges visible |

### Test Case TC-LIST-5: Empty State (No Lawyers)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-LIST-5 | View tab with no lawyers | Tab with 0 lawyers | Shows "No [status] lawyers found" message with alert icon |

---

## 3. Search Functionality Testing

### Test Case TC-SEARCH-1: Search by Email
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-1 | Search lawyer by email | Search: "lawyer@example.com" | Shows only lawyers matching the email |

### Test Case TC-SEARCH-2: Search by Name
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-2 | Search lawyer by name | Search: "John Doe" | Shows only lawyers with matching name |

### Test Case TC-SEARCH-3: Search by License Number
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-3 | Search lawyer by license | Search: "BAR12345" | Shows only lawyers with matching license number |

### Test Case TC-SEARCH-4: Search by Bar Council ID
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-4 | Search lawyer by bar council ID | Search: "BC789" | Shows only lawyers with matching bar council ID |

### Test Case TC-SEARCH-5: Search with No Results
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-5 | Search with non-existent term | Search: "nonexistent123" | Shows empty state, no lawyers displayed |

### Test Case TC-SEARCH-6: Search with Empty String
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-6 | Clear search field | Search: "" (empty) | Shows all lawyers in current tab |

### Test Case TC-SEARCH-7: Case Insensitive Search
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-SEARCH-7 | Search with different case | Search: "JOHN" (uppercase) | Shows lawyers with "john" (case insensitive match) |

---

## 4. Lawyer Verification Testing (Approve)

### Test Case TC-VERIFY-1: Approve Lawyer (No Notes)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-VERIFY-1 | Approve lawyer without notes | Click "Approve" button, Notes: empty | Status changes to "approved", Success toast, Lawyer moves to "Approved" tab, User's is_lawyer_verified = true |

### Test Case TC-VERIFY-2: Approve Lawyer (With Notes)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-VERIFY-2 | Approve lawyer with notes | Click "Approve", Notes: "All documents verified" | Status changes to "approved", Notes saved, Success toast, Notes visible in profile |

### Test Case TC-VERIFY-3: Approve Multiple Lawyers
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-VERIFY-3 | Approve multiple lawyers sequentially | Approve Lawyer 1, then Lawyer 2 | Both lawyers approved successfully, Both move to "Approved" tab |

### Test Case TC-VERIFY-4: Approve Lawyer (Long Notes)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-VERIFY-4 | Approve with very long notes | Notes: 500+ characters | Notes saved successfully, Displayed correctly in profile |

---

## 5. Lawyer Verification Testing (Reject)

### Test Case TC-REJECT-1: Reject Lawyer (No Notes)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-REJECT-1 | Reject lawyer without notes | Click "Reject" button, Notes: empty | Status changes to "rejected", Success toast, Lawyer moves to "Rejected" tab, User's is_lawyer_verified = false |

### Test Case TC-REJECT-2: Reject Lawyer (With Notes)
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-REJECT-2 | Reject lawyer with notes | Click "Reject", Notes: "Missing license documents" | Status changes to "rejected", Notes saved, Success toast, Notes visible in profile |

### Test Case TC-REJECT-3: Reject Already Approved Lawyer
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-REJECT-3 | Reject an approved lawyer | Lawyer status: "approved", Click "Reset to Pending" then "Reject" | Status changes to "rejected", Success toast |

---

## 6. Status Reset Testing

### Test Case TC-RESET-1: Reset Approved to Pending
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-RESET-1 | Reset approved lawyer to pending | Lawyer status: "approved", Click "Reset to Pending" | Status changes to "pending", Lawyer moves to "Pending" tab |

### Test Case TC-RESET-2: Reset Rejected to Pending
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-RESET-2 | Reset rejected lawyer to pending | Lawyer status: "rejected", Click "Reset to Pending" | Status changes to "pending", Lawyer moves to "Pending" tab |

---

## 7. Error Handling Testing

### Test Case TC-ERROR-1: Network Error During Load
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-ERROR-1 | Backend server offline | Disconnect backend, Load page | Error message displayed, "Unable to load lawyers" toast |

### Test Case TC-ERROR-2: Network Error During Verify
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-ERROR-2 | Network error while approving | Disconnect backend, Click "Approve" | Error toast: "Unable to verify lawyer", Status unchanged |

### Test Case TC-ERROR-3: Invalid Lawyer ID
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-ERROR-3 | Verify non-existent lawyer | Lawyer ID: "invalid123", Click "Approve" | Error toast: "Lawyer not found" |

### Test Case TC-ERROR-4: Unauthorized Verify Request
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-ERROR-4 | Non-admin tries to verify (API call) | User loses admin status, Click "Approve" | Error toast: "Access denied. Admin only." |

---

## 8. UI/UX Testing

### Test Case TC-UI-1: Loading State
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-UI-1 | Page loading | Initial page load | Shows "Loading lawyers..." message |

### Test Case TC-UI-2: Status Badge Colors
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-UI-2 | Verify status badge colors | View different status lawyers | Pending: Yellow, Approved: Green, Rejected: Red |

### Test Case TC-UI-3: Status Icons
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-UI-3 | Verify status icons display | View different status lawyers | Pending: Clock icon, Approved: CheckCircle, Rejected: XCircle |

### Test Case TC-UI-4: Button Disabled State
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-UI-4 | Buttons disabled during verification | Click "Approve", Verify in progress | Buttons disabled, Cannot click multiple times |

### Test Case TC-UI-5: Responsive Design
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-UI-5 | Page on mobile device | View on mobile (375px width) | Layout adapts, All elements visible and clickable |

---

## 9. Data Display Testing

### Test Case TC-DATA-1: Complete Lawyer Information
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-DATA-1 | Verify all lawyer fields displayed | View any lawyer card | Shows: Name, Email, License, Bar Council ID, Experience, Specializations, Education, Law Firm, Bio |

### Test Case TC-DATA-2: Missing Optional Fields
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-DATA-2 | Lawyer with missing optional data | Lawyer with no bio, no specializations | Shows "N/A" or "None" for missing fields, No errors |

### Test Case TC-DATA-3: Verification Notes Display
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-DATA-3 | Display existing verification notes | Lawyer with verification_notes | Notes displayed in highlighted box below lawyer info |

---

## 10. Tab Navigation Testing

### Test Case TC-TAB-1: Switch Between Tabs
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-TAB-1 | Navigate between status tabs | Click "Pending" → "Approved" → "Rejected" | Correct lawyers displayed for each tab, Search resets per tab |

### Test Case TC-TAB-2: Tab Count Updates
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-TAB-2 | Count badges update after verification | Approve a lawyer, Check tab counts | Pending count decreases, Approved count increases |

---

## 11. Concurrent Operations Testing

### Test Case TC-CONC-1: Multiple Admins Verify Same Lawyer
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-CONC-1 | Two admins verify same lawyer simultaneously | Admin 1 and Admin 2 approve same lawyer | Last action wins, No data corruption, Both see updated status |

---

## 12. Edge Cases Testing

### Test Case TC-EDGE-1: Very Long Lawyer Name
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-EDGE-1 | Lawyer with very long name | Name: 100+ characters | Name displayed correctly, UI doesn't break |

### Test Case TC-EDGE-2: Special Characters in Search
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-EDGE-2 | Search with special characters | Search: "test@#$%^&*()" | Handles gracefully, No errors, Shows appropriate results or empty |

### Test Case TC-EDGE-3: Rapid Tab Switching
| Test Case ID | Test Description | Test Input | Expected Result |
|--------------|------------------|------------|-----------------|
| TC-EDGE-3 | Rapidly switch between tabs | Click tabs quickly 10 times | All requests complete, No duplicate data, UI remains responsive |

---

## Test Coverage Summary

### Functional Coverage
- ✅ Access Control: 3/3 test cases (100%)
- ✅ List Display: 5/5 test cases (100%)
- ✅ Search Functionality: 7/7 test cases (100%)
- ✅ Approve Functionality: 4/4 test cases (100%)
- ✅ Reject Functionality: 3/3 test cases (100%)
- ✅ Status Reset: 2/2 test cases (100%)
- ✅ Error Handling: 4/4 test cases (100%)
- ✅ UI/UX: 5/5 test cases (100%)
- ✅ Data Display: 3/3 test cases (100%)
- ✅ Tab Navigation: 2/2 test cases (100%)
- ✅ Concurrent Operations: 1/1 test case (100%)
- ✅ Edge Cases: 3/3 test cases (100%)

### Total Test Cases: 42
### Coverage: 100% of identified functionality

---

## Test Execution Priority

### Priority 1 (Critical - Must Test)
- TC-AC-1, TC-AC-2, TC-AC-3 (Access Control)
- TC-VERIFY-1, TC-VERIFY-2 (Approve Functionality)
- TC-REJECT-1, TC-REJECT-2 (Reject Functionality)
- TC-ERROR-1, TC-ERROR-2 (Error Handling)

### Priority 2 (High - Should Test)
- TC-LIST-1, TC-LIST-2, TC-LIST-3 (List Display)
- TC-SEARCH-1, TC-SEARCH-2, TC-SEARCH-5 (Search Functionality)
- TC-UI-1, TC-UI-4 (UI States)

### Priority 3 (Medium - Nice to Test)
- TC-SEARCH-3, TC-SEARCH-4, TC-SEARCH-6, TC-SEARCH-7
- TC-DATA-1, TC-DATA-2, TC-DATA-3
- TC-TAB-1, TC-TAB-2

### Priority 4 (Low - Optional)
- TC-EDGE-1, TC-EDGE-2, TC-EDGE-3
- TC-CONC-1
- TC-VERIFY-3, TC-VERIFY-4

---

## Test Results Template

| Test Case ID | Status | Pass/Fail | Notes |
|--------------|--------|-----------|-------|
| TC-AC-1 | ⬜ | ⬜ | |
| TC-AC-2 | ⬜ | ⬜ | |
| TC-AC-3 | ⬜ | ⬜ | |
| ... | ... | ... | ... |

**Status**: ⬜ Not Tested | 🟡 In Progress | ✅ Pass | ❌ Fail

---

## Notes
- All test cases should be executed in a test environment with sample lawyer data
- Test data should include lawyers in all statuses (pending, approved, rejected)
- Network conditions should be tested (slow connection, offline)
- Cross-browser testing recommended for UI test cases

