import {
    FileCheck2,
    FileScan,
    House,
    LogIn,
    ScanFace,
    ShieldCheck,
    Users,
    type LucideIcon,
} from 'lucide-react-native';

import { setDevMockApi } from '@/api';
import { setRegistrationToken } from '@/api/client';
import { mockUser } from '@/api/mock';
import {
    biometricConsentGiven,
    faceEnrollmentCompleted,
    sessionEnded,
    sessionStarted,
} from '@/features/auth/slice';
import { accountDetailsStore } from '@/services/accountDetailsStore';
import { flowGuards } from '@/services/flowGuards';
import { setScanResult } from '@/services/scanStore';
import type { AppDispatch } from '@/store';

export type DemoSession = 'signed-out' | 'new-member' | 'member';

export interface DemoScreen {
  title: string;
  route: string;
  session: DemoSession;
  /** Grants the one-shot guards / in-memory state the screen's deep-link guard needs. */
  prepare?: (dispatch: AppDispatch) => void;
}

export interface DemoGroup {
  title: string;
  blurb: string;
  icon: LucideIcon;
  screens: DemoScreen[];
}

// 1×1 PNG stand-in for a captured scan so /document/processing runs.
const SCAN_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export const DEMO_GROUPS: DemoGroup[] = [
  {
    title: 'Home & wallet',
    blurb: 'The everyday app — pass, documents, check-ins',
    icon: House,
    screens: [
      { title: 'Home', route: '/(tabs)', session: 'member' },
      { title: 'Documents wallet', route: '/(tabs)/documents', session: 'member' },
      { title: 'Check-ins', route: '/(tabs)/history', session: 'member' },
      { title: 'Booking detail', route: '/booking/b1', session: 'member' },
      { title: 'Identity overview', route: '/identity', session: 'member' },
      { title: 'Notifications', route: '/notification', session: 'member' },
    ],
  },
  {
    title: 'Sign up & sign in',
    blurb: 'Welcome, account creation and login',
    icon: LogIn,
    screens: [
      { title: 'Welcome', route: '/(auth)/welcome', session: 'signed-out' },
      { title: 'Create account', route: '/(auth)/register', session: 'signed-out' },
      { title: 'Verify phone code', route: '/(auth)/verify-phone?phone=5550102938&registrationId=demo-reg-1', session: 'signed-out' },
      {
        title: 'Account details & PIN',
        route: '/(auth)/account-details',
        session: 'signed-out',
        prepare: () => setRegistrationToken('demo-registration-token'),
      },
      {
        title: 'Verify email code',
        route: '/(auth)/verify-email?email=sarah.kim@example.com',
        session: 'signed-out',
        prepare: () => {
          setRegistrationToken('demo-registration-token');
          accountDetailsStore.stash({
            fullName: 'Sarah Kim',
            dateOfBirth: '04/12/1990',
            pin: '1234',
            email: 'sarah.kim@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          });
        },
      },
      { title: 'Sign in', route: '/(auth)/login', session: 'signed-out' },
      { title: 'Forgot password', route: '/(auth)/forgot-password', session: 'signed-out' },
      { title: 'Reset password', route: '/(auth)/forgot-password?step=reset', session: 'signed-out' },
    ],
  },
  {
    title: 'Face ID setup',
    blurb: 'Consent, liveness scan and the pass reveal',
    icon: ScanFace,
    screens: [
      { title: 'Biometric consent', route: '/(onboarding)/consent', session: 'new-member' },
      {
        title: 'Face scan intro',
        route: '/(onboarding)/face-scan',
        session: 'new-member',
        prepare: (dispatch) => dispatch(biometricConsentGiven()),
      },
      { title: 'Liveness — scanning', route: '/dev-liveness?stage=challenge', session: 'new-member' },
      { title: 'Liveness — verifying', route: '/dev-liveness?stage=finishing', session: 'new-member' },
      { title: 'Liveness — verified', route: '/dev-liveness?stage=passed', session: 'new-member' },
      { title: 'Liveness — failed', route: '/dev-liveness?stage=failed', session: 'new-member' },
      {
        title: 'Pass is live',
        route: '/(onboarding)/face-enrolled',
        session: 'new-member',
        prepare: () => flowGuards.grant('onboarding:face-enrolled'),
      },
    ],
  },
  {
    title: 'Add a document',
    blurb: 'Choose, scan, match and verify an ID',
    icon: FileScan,
    screens: [
      { title: 'Choose document type', route: '/document/select-type', session: 'member' },
      { title: 'Scan document', route: '/document/scan', session: 'member' },
      {
        title: 'Processing & matching',
        route: '/document/processing?type=passport&label=Passport',
        session: 'member',
        prepare: () => setScanResult({ documentImageBase64: SCAN_IMAGE, selfieBase64: SCAN_IMAGE }),
      },
      {
        title: 'Details mismatch',
        route: '/document/mismatch?docId=d1&profileName=Sarah+Kim&profileDob=04%2F12%2F1990&docName=Sara+Kim&docDob=04%2F21%2F1990',
        session: 'member',
        prepare: () => flowGuards.grant('document:mismatch'),
      },
      {
        title: 'Document verified',
        route: '/document/verified?docId=d1&docLabel=Passport&docType=passport&outcome=approved&matchScore=0.95&extractedName=Sarah+Kim&extractedDob=04%2F12%2F1990',
        session: 'member',
        prepare: () => flowGuards.grant('document:verified'),
      },
      { title: 'Document detail', route: '/document/d1', session: 'member' },
    ],
  },
  {
    title: 'Family',
    blurb: 'Add children and manage their entry',
    icon: Users,
    screens: [
      { title: 'Family members', route: '/family', session: 'member' },
      { title: 'Member profile', route: '/family/f1', session: 'member' },
      { title: 'Add member — details', route: '/family/add', session: 'member' },
      { title: 'Add member — document', route: '/family/add/document?name=Max+Kim&band=5-9&dob=2018-06-15&relationship=Child', session: 'member' },
      { title: 'Add member — face capture', route: '/family/add/face-capture?name=Max&age=7&personId=f1', session: 'member' },
      { title: 'Add member — photo (under 5)', route: '/family/add/photo-capture?name=Noah&age=3&personId=f1', session: 'member' },
    ],
  },
  {
    title: 'Profile & security',
    blurb: 'Profile, PIN, password and face update',
    icon: ShieldCheck,
    screens: [
      { title: 'Profile', route: '/profile', session: 'member' },
      { title: 'Edit profile', route: '/profile/edit', session: 'member' },
      { title: 'Security', route: '/security', session: 'member' },
      { title: 'Confirm PIN', route: '/security/confirm-pin?next=/security', session: 'member' },
      { title: 'Change PIN', route: '/security/change-pin', session: 'member' },
      { title: 'Change password', route: '/security/change-password', session: 'member' },
      { title: 'Update face — PIN', route: '/face-update/pin', session: 'member' },
      { title: 'Update face — retry', route: '/face-update/error', session: 'member' },
      {
        title: 'Update face — done',
        route: '/face-update/success',
        session: 'member',
        prepare: () => flowGuards.grant('face-update:done'),
      },
      { title: 'Appearance', route: '/settings', session: 'member' },
    ],
  },
  {
    title: 'Account & legal',
    blurb: 'Notices, privacy, help and account deletion',
    icon: FileCheck2,
    screens: [
      { title: 'Turning 18 notice', route: '/notification/age-18', session: 'member' },
      { title: 'Data & privacy', route: '/legal/data-privacy', session: 'member' },
      { title: 'Privacy policy', route: '/legal/privacy-policy', session: 'member' },
      { title: 'Terms of service', route: '/legal/terms', session: 'member' },
      { title: 'Help centre', route: '/help', session: 'member' },
      { title: 'About Truepas', route: '/about', session: 'member' },
      { title: 'Delete account', route: '/account/delete', session: 'member' },
      {
        title: 'Delete account — success',
        route: '/account/delete/success',
        session: 'member',
        prepare: () => flowGuards.grant('account:deleted'),
      },
    ],
  },
];

/** Forge the session the screen expects. Demo mode always runs on mock data. */
export function applyDemoSession(dispatch: AppDispatch, session: DemoSession) {
  setDevMockApi(true);
  if (session === 'signed-out') {
    dispatch(sessionEnded());
  } else if (session === 'new-member') {
    dispatch(sessionStarted({ user: { ...mockUser, faceEnrolled: false, biometricConsentAt: null }, accessToken: 'demo-token' }));
  } else {
    dispatch(sessionStarted({ user: mockUser, accessToken: 'demo-token' }));
    dispatch(faceEnrollmentCompleted());
  }
}
