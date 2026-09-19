import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { MinTapTarget, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ label, variant = 'primary', disabled, style, ...rest }: Props) {
  const theme = useTheme();
  const background =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.danger
        : variant === 'secondary'
          ? theme.backgroundElement
          : 'transparent';
  const color =
    variant === 'primary' ? theme.primaryText : variant === 'danger' ? '#FFFFFF' : theme.text;
  const borderColor = variant === 'secondary' ? theme.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      style={(state: PressableStateCallbackType) => {
        const resolvedStyle = typeof style === 'function' ? style(state) : style;
        return [
          styles.base,
          { backgroundColor: background, borderColor, opacity: disabled || state.pressed ? 0.7 : 1 },
          resolvedStyle,
        ] as StyleProp<ViewStyle>;
      }}
      {...rest}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTapTarget,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
