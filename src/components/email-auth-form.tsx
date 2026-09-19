import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  busy: boolean;
};

export function EmailAuthForm({ emailLabel, passwordLabel, submitLabel, onSubmit, busy }: Props) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.form}>
      <ThemedText type="smallBold">{emailLabel}</ThemedText>
      <TextInput
        accessibilityLabel={emailLabel}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      />
      <ThemedText type="smallBold">{passwordLabel}</ThemedText>
      <TextInput
        accessibilityLabel={passwordLabel}
        autoCapitalize="none"
        autoComplete="password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      />
      <Button
        label={submitLabel}
        disabled={busy || email.trim().length === 0 || password.length < 8}
        onPress={() => onSubmit(email, password)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
  },
  input: {
    minHeight: MinTapTarget,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
