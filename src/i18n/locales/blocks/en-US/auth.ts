export const enUSAuthMessages = {
  auth: {
    sign_in: 'Sign in',
    title: 'Sign in to AI Agent',
    description:
      'Supabase social sign-in is now wired in. Once you authenticate, upcoming session persistence and memory features will build on your account.',
    back_to_chat: 'Back to chat',
    sign_in_with_google: 'Continue with Google',
    sign_in_with_github: 'Continue with GitHub',
    terms_agreement: 'By signing up, you agree to our',
    terms_of_service: 'Terms of Service',
    privacy_policy: 'Privacy Policy',
    github_description:
      'You will be redirected to GitHub to authorize and then sent back to this app.',
    oauth_description:
      'You will be redirected to the provider to authorize and then sent back to this app.',
    signed_in_as: 'Signed in as',
    signed_in_description:
      'Your account is connected. You can go back to chat now, and the next storage and memory steps will build on this login state.',
    continue_to_chat: 'Continue to chat',
    sign_out: 'Sign out',
    configuration_missing_title: 'Supabase configuration missing',
    configuration_missing_description:
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before using social sign-in.',
    errors: {
      oauth_callback:
        'OAuth callback failed. Check your Supabase redirect URL and your Google / GitHub OAuth configuration.',
      sign_in_failed: 'Sign in failed, please try again',
      sign_out_failed: 'Sign out failed, please try again',
    },
    toast: {
      sign_out_success: 'Signed out successfully',
    },
  },
} as const;
