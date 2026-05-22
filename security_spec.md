# Security Specification: Miss Moçambique Curation & Voting Platform

## Phase 0: Payload-First Security TDD

This specification defines the strict security postures and data integrity invariants for the Miss Moçambique platform, preventing update gaps, privilege escalation, resource exhaustion, and transaction fraud.

---

### 1. Data Invariants

1. **Candidate Profile Integrity (`candidates` collection):**
   - Public users can only read individual profiles (with strict query limits) if their status is `'approved'`.
   - Creating a candidate requires the state to be set initially to `'pending'`.
   - The fields `votesCount`, `viewsCount`, and `juryScore` cannot be modified by any public user or candidate itself. They are updated exclusively under authorized actions (like voting or jury evaluation submission) or by admins.
   - The field `createdAt` must match the server timestamp (`request.time`).

2. **Jury Evaluation (`evaluations` collection):**
   - Only authenticated users with the certified `jury` role can write/create evaluations.
   - Every individual attribute (`communication`, `presence`, `confidence`, `runway`, `talent`) must be an integer between 1 and 10 (inclusive).
   - The `juryId` in the written document must match `request.auth.uid` to prevent identity spoofing.

3. **Vote Transaction Guarding (`transactions` collection):**
   - Transactions once completed are terminal and immutable; no updates or deletions are allowed.
   - The transaction amount in Meticais (`amountMZN`) must exactly equal `votesQuantity * settings.paidVotePriceMZN`, or 0 for free/one-time votes.
   - The field `createdAt` must match `request.time`.

4. **System Settings Curation (`settings` collection):**
   - Only authenticated global `admin` members can create or update settings. All public/jury roles can only perform read operations.
   - Weighted values (`juryVoteWeight` and `publicVoteWeight`) must sum strictly to 100%.

5. **Audit Trail Preservation (`auditLogs` collection):**
   - Audit logs are write-only. No user (including administrators) is allowed to update or delete any audit log record once saved.
   - `ipAddress` must be validated for length and safety, and `createdAt` must be strictly set to the server timestamp `request.time`.

---

### 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads attempt to bypass security boundaries, inject invalid data states, or spoof identities. These must be rejected with `PERMISSION_DENIED` by the final security rules.

#### Payload 1: Direct Vote Injection (Public Voting Bypass)
- **Path:** `/candidates/cand-mariana`
- **Action:** Update
- **Identity:** Anonymous or normal public user (`userId: voter-123`, `role: public`)
- **Malicious Payload:** 
  ```json
  {
    "votesCount": 999999
  }
  ```
- **Reason to Deny:** Public users cannot directly increment `votesCount` on a candidate document except through a verified transaction workflow.

#### Payload 2: Admin Privilege Self-Assignment
- **Path:** `/admins/voter-123`
- **Action:** Create
- **Identity:** Unverified public user (`userId: voter-123`)
- **Malicious Payload:**
  ```json
  {
    "userId": "voter-123",
    "role": "admin"
  }
  ```
- **Reason to Deny:** No user is allowed to write into the `admins` lookup container without explicit system-level authority.

#### Payload 3: Fraudulent Status Upgrades (Self-Approval)
- **Path:** `/candidates/cand-my-profile`
- **Action:** Create / Update
- **Identity:** Verified Candidate (`uid: cand-my-profile`)
- **Malicious Payload:**
  ```json
  {
    "stageName": "Luisa",
    "status": "approved",
    "votesCount": 100
  }
  ```
- **Reason to Deny:** Candidates must be created with `status: "pending"`. No non-admin can update `status` to `"approved"`.

#### Payload 4: Invalid Rating range (Jury Score Poisoning)
- **Path:** `/evaluations/eval-spoof-1`
- **Action:** Create
- **Identity:** Authenticated Juror (`uid: jury-alex`)
- **Malicious Payload:**
  ```json
  {
    "candidateId": "cand-mariana",
    "juryId": "jury-alex",
    "juryName": "Alex",
    "communication": 15,
    "presence": 10,
    "confidence": -2,
    "runway": 10,
    "talent": 8,
    "createdAt": "2026-05-22T16:20:00Z"
  }
  ```
- **Reason to Deny:** Ratings must be strictly bounded between 1 and 10. Negative or excessive metrics are prohibited.

#### Payload 5: Jury Impersonation Write
- **Path:** `/evaluations/eval-hijack`
- **Action:** Create
- **Identity:** Compromised User (`uid: hacker-boy`)
- **Malicious Payload:**
  ```json
  {
    "candidateId": "cand-mariana",
    "juryId": "jury-filipe",
    "juryName": "Official Jury Filipe",
    "communication": 10,
    "presence": 10,
    "confidence": 10,
    "runway": 10,
    "talent": 10,
    "createdAt": "2026-05-22T16:20:00Z"
  }
  ```
- **Reason to Deny:** `juryId` must exactly equal `request.auth.uid`. Writing on behalf of another juror is blocked.

#### Payload 6: Financial Spoofing - Free Vote Charge bypass
- **Path:** `/transactions/tx-freebie-fraud`
- **Action:** Create
- **Identity:** Public user (`uid: voter-normal`)
- **Malicious Payload:**
  ```json
  {
    "candidateId": "cand-mariana",
    "candidateName": "Mariana",
    "votesQuantity": 1000,
    "paymentMethod": "mpesa",
    "amountMZN": 0,
    "status": "completed",
    "createdAt": "2026-05-22T16:20:00Z"
  }
  ```
- **Reason to Deny:** Paid votes must cost exactly `votesQuantity * settings.paidVotePriceMZN`. Inserting 1000 votes for 0 MZN is fraud.

#### Payload 7: Historical Settings Hijack
- **Path:** `/settings/global`
- **Action:** Update
- **Identity:** Public User (`uid: voter-normal`)
- **Malicious Payload:**
  ```json
  {
    "publicVoteWeight": 100,
    "juryVoteWeight": 0
  }
  ```
- **Reason to Deny:** Non-admins cannot modify contest-wide weights or regulamento phases.

#### Payload 8: Immutable Audit Log Tampering
- **Path:** `/auditLogs/log-critical-hash`
- **Action:** Update
- **Identity:** Administrative Supervisor (`uid: admin-987`)
- **Malicious Payload:**
  ```json
  {
    "details": "All system parameters clear, no errors logged"
  }
  ```
- **Reason to Deny:** Audit logs are write-once/no-update. Even administrators cannot rewrite their own history.

#### Payload 9: ID Poisoning Attack with character injection
- **Path:** `/candidates/INVALID_PATH_CHARACTER_%20_OR_JUNK_$$$`
- **Action:** Get / Create
- **Identity:** Any user
- **Reason to Deny:** Document IDs must conform to the alphanumeric regex standard `^[a-zA-Z0-9_\-]+$`. Direct lookup of malformed paths must be blocked.

#### Payload 10: Value Type Poisoning / Denial of Wallet
- **Path:** `/candidates/cand-mariana`
- **Action:** Update
- **Identity:** Authenticated Voter (`uid: voter-normal`)
- **Malicious Payload:**
  ```json
  {
    "biography": "Lorem ipsum dolor sit amet,..." // A 5MB string
  }
  ```
- **Reason to Deny:** Size limits must be enforced on all string and array attributes to prevent resource consumption attacks.

#### Payload 11: Future/Past Creation spoofing
- **Path:** `/transactions/tx-past-timestamp`
- **Action:** Create
- **Identity:** Public user
- **Malicious Payload:**
  ```json
  {
    "candidateId": "cand-mariana",
    "createdAt": "1999-01-01T00:00:00Z"
  }
  ```
- **Reason to Deny:** Timestamp fields must rely strictly on `request.time`.

#### Payload 12: Orphaned Evaluation Creation
- **Path:** `/evaluations/eval-phantom`
- **Action:** Create
- **Identity:** Valid Jury member
- **Malicious Payload:**
  ```json
  {
    "candidateId": "cand-nonexistent-id",
    "juryId": "jury-alex",
    "...": "..."
  }
  ```
- **Reason to Deny:** Relational consistency checking requires verifying that the target `candidateId` actually exists in the `/candidates` collection.

---

### 3. Test Runner Design (`firestore.rules.test.ts`)

```typescript
import { 
  assertFails, 
  assertSucceeds, 
  initializeTestEnvironment, 
  RulesTestEnvironment 
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'mercurial-surf-407pf',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Miss Moçambique Security Rules', () => {
  test('rejects direct votes tampering by public user (Payload 1)', async () => {
    const context = testEnv.authenticatedContext('voter-123');
    await assertFails(
      context.firestore().collection('candidates').doc('cand-mariana').update({
        votesCount: 999999
      })
    );
  });

  test('rejects auto-assigned admin role (Payload 2)', async () => {
    const context = testEnv.authenticatedContext('voter-123');
    await assertFails(
      context.firestore().collection('admins').doc('voter-123').set({
        role: 'admin'
      })
    );
  });

  test('prevents non-admins from self-approving profiles (Payload 3)', async () => {
    const context = testEnv.authenticatedContext('cand-my-profile');
    await assertFails(
      context.firestore().collection('candidates').doc('cand-my-profile').update({
        status: 'approved'
      })
    );
  });

  test('rejects scores outside of 1-10 range (Payload 4)', async () => {
    const context = testEnv.authenticatedContext('jury-alex');
    await assertFails(
      context.firestore().collection('evaluations').doc('eval-spoof-1').set({
        candidateId: 'cand-mariana',
        juryId: 'jury-alex',
        juryName: 'Alex',
        communication: 15,
        presence: 10,
        confidence: -2,
        runway: 10,
        talent: 8,
        createdAt: new Date()
      })
    );
  });

  test('prevents audit logs updates once created (Payload 8)', async () => {
    const context = testEnv.authenticatedContext('admin-987');
    await assertFails(
      context.firestore().collection('auditLogs').doc('log-critical-hash').update({
        details: 'Hacked history record'
      })
    );
  });
});
```
