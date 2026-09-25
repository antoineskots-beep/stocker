import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateAlert } from '@/lib/hooks';

type Props = {
  visible: boolean;
  symbol: string;
  companyName?: string | null;
  currentPrice?: number | null;
  currency?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

type AlertType = 'price_above' | 'price_below' | 'buy_zone';

export function CreateAlertModal({
  visible,
  symbol,
  companyName,
  currentPrice,
  currency,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const createAlert = useCreateAlert();

  const [type, setType] = useState<AlertType>('price_below');
  const [targetStr, setTargetStr] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const alertTypes: { key: AlertType; label: string }[] = [
    { key: 'price_below', label: t('alerts.priceBelow') },
    { key: 'price_above', label: t('alerts.priceAbove') },
    { key: 'buy_zone', label: t('alerts.buyZone') },
  ];

  function handleClose() {
    setValidationError(null);
    setTargetStr('');
    onClose();
  }

  async function handleSubmit() {
    setValidationError(null);
    const parsed = parseFloat(targetStr.replace(',', '.').trim());

    if (isNaN(parsed) || parsed <= 0) {
      setValidationError(t('alerts.invalidPrice'));
      return;
    }

    try {
      await createAlert.mutateAsync({
        symbol,
        type,
        rule: 'fixed_price',
        value: parsed,
      });
      handleClose();
      onSuccess?.();
    } catch {
      setValidationError(t('states.errorTitle'));
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
            },
          ]}>
          <ThemedText type="subtitle" style={styles.title}>
            {t('alerts.createTitle')}
          </ThemedText>

          <ThemedText type="smallBold" themeColor="primary">
            {symbol} {companyName ? `• ${companyName}` : ''}
          </ThemedText>

          {currentPrice != null ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('alerts.currentPrice', {
                price: currentPrice.toFixed(2),
                currency: currency ?? '',
              })}
            </ThemedText>
          ) : null}

          {/* Type selector */}
          <View style={styles.field}>
            <ThemedText type="smallBold">{t('alerts.type')}</ThemedText>
            <View style={styles.typeOptions}>
              {alertTypes.map((opt) => {
                const selected = type === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: selected
                          ? theme.backgroundSelected
                          : theme.background,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => setType(opt.key)}>
                    <ThemedText
                      type={selected ? 'smallBold' : 'small'}
                      style={{ color: selected ? theme.primary : theme.text }}>
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Target price input */}
          <View style={styles.field}>
            <ThemedText type="smallBold">{t('alerts.targetPrice')}</ThemedText>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: theme.background,
                  borderColor: validationError ? theme.danger : theme.border,
                },
              ]}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                $
              </ThemedText>
              <TextInput
                value={targetStr}
                onChangeText={(val) => {
                  setTargetStr(val);
                  if (validationError) setValidationError(null);
                }}
                placeholder={
                  currentPrice
                    ? currentPrice.toFixed(2)
                    : t('alerts.targetPricePlaceholder')
                }
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                autoFocus
                style={[styles.input, { color: theme.text }]}
              />
              {currency ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {currency}
                </ThemedText>
              ) : null}
            </View>
            {validationError ? (
              <ThemedText type="small" themeColor="danger">
                {validationError}
              </ThemedText>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              label={t('common.cancel')}
              variant="secondary"
              onPress={handleClose}
              style={styles.actionBtn}
            />
            <Button
              label={t('alerts.create')}
              variant="primary"
              disabled={createAlert.isPending}
              onPress={handleSubmit}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.four,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  field: {
    gap: Spacing.one,
  },
  typeOptions: {
    gap: Spacing.one,
  },
  typeOption: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    minHeight: MinTapTarget,
    gap: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  actionBtn: {
    flex: 1,
  },
});
