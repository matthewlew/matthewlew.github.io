# One Token — Platform Translation Test

The same card component implemented in three stacks.
Same seven roles. Same four classes. Different syntax.

Use this file to verify One Token works in your project.
Point your AI at SKILL.md and this file, then ask it to
build a new component. It should follow the same patterns.

---

## The prompt to give your AI

> "Using One Token (see SKILL.md), build a card component
> with a label, title, divider, body text, meta row with
> an icon, and a button. Theme: light mode, brand hue,
> soft emphasis. Follow the platform patterns in
> PLATFORM-TEST.md."

The AI should produce something that matches the examples
below — no hardcoded colors, all seven roles used.

---

## Web (CSS + HTML)

Already in SKILL.md. This is the reference implementation.

---

## React Native

### Theme setup — do this once at the root

```tsx
// theme.ts
export type OneTokenTheme = {
  background:    string;
  text:          string;
  textAccent:    string;
  textSubdued:   string;
  icon:          string;
  border:        string;
  borderSubdued: string;
};

// Themes — mode × emphasis × hue
// Same rules as SKILL.md, expressed as objects
export const themes: Record<string, OneTokenTheme> = {

  'light-soft-brand': {
    background:    '#EAF5EE',  // hue-50
    text:          '#0D3D1E',  // hue-800
    textAccent:    '#196634',  // hue-600
    textSubdued:   '#289049',  // hue-500
    icon:          '#36A55D',  // hue-400
    border:        '#80CB99',  // hue-200
    borderSubdued: '#C6E7D1',  // hue-100
  },

  'light-strong-brand': {
    background:    '#289049',  // hue-500
    text:          '#FFFFFF',
    textAccent:    '#C6E7D1',  // hue-100
    textSubdued:   '#80CB99',  // hue-200
    icon:          '#80CB99',  // hue-200
    border:        '#196634',  // hue-600
    borderSubdued: '#36A55D',  // hue-400
  },

  'dark-soft-brand': {
    background:    '#071F0F',  // hue-900
    text:          '#C6E7D1',  // hue-100
    textAccent:    '#80CB99',  // hue-200
    textSubdued:   '#36A55D',  // hue-400
    icon:          '#36A55D',  // hue-400
    border:        '#0D3D1E',  // hue-800
    borderSubdued: '#071F0F',  // hue-900
  },

  'light-soft-red': {
    background:    '#FEF0EE',  // red-50
    text:          '#5B1008',  // red-800
    textAccent:    '#9B241A',  // red-600
    textSubdued:   '#D03328',  // red-500
    icon:          '#F04438',  // red-400
    border:        '#F99C91',  // red-200
    borderSubdued: '#FDD4CF',  // red-100
  },

};

// Context
import React, { createContext, useContext } from 'react';
const ThemeContext = createContext<OneTokenTheme>(themes['light-soft-brand']);
export const useTheme = () => useContext(ThemeContext);
export const ThemeProvider = ({
  theme,
  children,
}: {
  theme: OneTokenTheme;
  children: React.ReactNode;
}) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);
```

```tsx
// App.tsx — set theme on root, everything inherits
import { ThemeProvider, themes } from './theme';

export default function App() {
  return (
    <ThemeProvider theme={themes['light-soft-brand']}>
      <Card />
    </ThemeProvider>
  );
}
```

### The card component

```tsx
// Card.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { useTheme } from './theme';

// Icon — replace with your icon library
const ClockIcon = ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 12 }}>⏱</Text>
);

export function Card() {
  const t = useTheme(); // ← the seven roles, resolved for this context

  return (
    <View style={[styles.card, {
      backgroundColor: t.background,   // --background
      borderColor:     t.border,        // --border
    }]}>

      {/* --text-accent: brand label */}
      <Text style={[styles.label, { color: t.textAccent }]}>
        New Arrival
      </Text>

      {/* --text: primary content */}
      <Text style={[styles.title, { color: t.text }]}>
        Iced Brown Sugar Oat Espresso
      </Text>

      {/* --border-subdued: divider between sections */}
      <View style={[styles.divider, { backgroundColor: t.borderSubdued }]} />

      {/* --text-subdued: supporting copy */}
      <Text style={[styles.body, { color: t.textSubdued }]}>
        Blonde espresso shaken with oat milk and brown sugar syrup.
      </Text>

      {/* --icon + --text-subdued: meta row */}
      <View style={styles.meta}>
        <ClockIcon color={t.icon} />
        <Text style={[styles.metaText, { color: t.textSubdued }]}>
          230 cal · Available now
        </Text>
      </View>

      {/* Button — same seven roles from context */}
      <TouchableOpacity style={[styles.button, {
        backgroundColor: t.background,
        borderColor:      t.border,
      }]}>
        <Text style={[styles.buttonText, { color: t.text }]}>
          Order Now
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// Structure only — no colors
const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  button: {
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
```

### Switching themes

```tsx
// Same card, different theme — override at any container level
<ThemeProvider theme={themes['light-strong-brand']}>
  <Card />   {/* full brand color background, white text */}
</ThemeProvider>

<ThemeProvider theme={themes['dark-soft-brand']}>
  <Card />   {/* dark mode */}
</ThemeProvider>

<ThemeProvider theme={themes['light-soft-red']}>
  <Card />   {/* error / red surface */}
</ThemeProvider>
```

---

## SwiftUI

### Theme setup — do this once

```swift
// OneTokenTheme.swift
import SwiftUI

struct OneTokenTheme {
    let background:    Color
    let text:          Color
    let textAccent:    Color
    let textSubdued:   Color
    let icon:          Color
    let border:        Color
    let borderSubdued: Color
}

// Theme definitions — same rules as SKILL.md
extension OneTokenTheme {

    static let lightSoftBrand = OneTokenTheme(
        background:    Color(hex: "#EAF5EE"),  // hue-50
        text:          Color(hex: "#0D3D1E"),  // hue-800
        textAccent:    Color(hex: "#196634"),  // hue-600
        textSubdued:   Color(hex: "#289049"),  // hue-500
        icon:          Color(hex: "#36A55D"),  // hue-400
        border:        Color(hex: "#80CB99"),  // hue-200
        borderSubdued: Color(hex: "#C6E7D1")   // hue-100
    )

    static let lightStrongBrand = OneTokenTheme(
        background:    Color(hex: "#289049"),  // hue-500
        text:          .white,
        textAccent:    Color(hex: "#C6E7D1"),  // hue-100
        textSubdued:   Color(hex: "#80CB99"),  // hue-200
        icon:          Color(hex: "#80CB99"),  // hue-200
        border:        Color(hex: "#196634"),  // hue-600
        borderSubdued: Color(hex: "#36A55D")   // hue-400
    )

    static let darkSoftBrand = OneTokenTheme(
        background:    Color(hex: "#071F0F"),  // hue-900
        text:          Color(hex: "#C6E7D1"),  // hue-100
        textAccent:    Color(hex: "#80CB99"),  // hue-200
        textSubdued:   Color(hex: "#36A55D"),  // hue-400
        icon:          Color(hex: "#36A55D"),  // hue-400
        border:        Color(hex: "#0D3D1E"),  // hue-800
        borderSubdued: Color(hex: "#071F0F")   // hue-900
    )

    static let lightSoftRed = OneTokenTheme(
        background:    Color(hex: "#FEF0EE"),
        text:          Color(hex: "#5B1008"),
        textAccent:    Color(hex: "#9B241A"),
        textSubdued:   Color(hex: "#D03328"),
        icon:          Color(hex: "#F04438"),
        border:        Color(hex: "#F99C91"),
        borderSubdued: Color(hex: "#FDD4CF")
    )
}

// Environment key — lets any child view read the theme
struct OneTokenThemeKey: EnvironmentKey {
    static let defaultValue = OneTokenTheme.lightSoftBrand
}
extension EnvironmentValues {
    var oneToken: OneTokenTheme {
        get { self[OneTokenThemeKey.self] }
        set { self[OneTokenThemeKey.self] = newValue }
    }
}

// Convenience hex initializer for Color
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8)  & 0xFF) / 255
        let b = Double(int         & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
```

```swift
// ContentView.swift — set theme at root, children inherit via environment
struct ContentView: View {
    var body: some View {
        CardView()
            .environment(\.oneToken, .lightSoftBrand)
    }
}
```

### The card component

```swift
// CardView.swift
struct CardView: View {
    @Environment(\.oneToken) var t  // ← the seven roles

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {

            // --text-accent: brand label
            Text("New Arrival")
                .font(.caption)
                .fontWeight(.bold)
                .kerning(0.8)
                .textCase(.uppercase)
                .foregroundColor(t.textAccent)

            // --text: primary title
            Text("Iced Brown Sugar Oat Espresso")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(t.text)

            // --border-subdued: divider
            Divider()
                .background(t.borderSubdued)

            // --text-subdued: body copy
            Text("Blonde espresso shaken with oat milk and brown sugar syrup.")
                .font(.system(size: 13))
                .foregroundColor(t.textSubdued)
                .lineSpacing(4)

            // --icon + --text-subdued: meta row
            HStack(spacing: 6) {
                Image(systemName: "clock")
                    .font(.system(size: 12))
                    .foregroundColor(t.icon)          // --icon
                Text("230 cal · Available now")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(t.textSubdued)   // --text-subdued
            }

            // Button — same seven roles from environment
            Button("Order Now") {}
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(t.text)
                .padding(.vertical, 9)
                .padding(.horizontal, 18)
                .background(t.background)
                .overlay(
                    RoundedRectangle(cornerRadius: 100)
                        .stroke(t.border, lineWidth: 1)  // --border
                )
                .cornerRadius(100)
        }
        .padding(16)
        .background(t.background)                        // --background
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(t.border, lineWidth: 1)          // --border
        )
        .cornerRadius(12)
    }
}
```

### Switching themes

```swift
// Same CardView, different theme — override at any level in the view tree
CardView()
    .environment(\.oneToken, .lightStrongBrand)  // full brand color

CardView()
    .environment(\.oneToken, .darkSoftBrand)     // dark mode

CardView()
    .environment(\.oneToken, .lightSoftRed)      // error surface
```

---

## Jetpack Compose

### Theme setup — do this once

```kotlin
// OneTokenTheme.kt
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color

data class OneTokenTheme(
    val background:    Color,
    val text:          Color,
    val textAccent:    Color,
    val textSubdued:   Color,
    val icon:          Color,
    val border:        Color,
    val borderSubdued: Color,
)

// Theme definitions — same rules as SKILL.md
object OneTokenThemes {

    val LightSoftBrand = OneTokenTheme(
        background    = Color(0xFFEAF5EE),  // hue-50
        text          = Color(0xFF0D3D1E),  // hue-800
        textAccent    = Color(0xFF196634),  // hue-600
        textSubdued   = Color(0xFF289049),  // hue-500
        icon          = Color(0xFF36A55D),  // hue-400
        border        = Color(0xFF80CB99),  // hue-200
        borderSubdued = Color(0xFFC6E7D1),  // hue-100
    )

    val LightStrongBrand = OneTokenTheme(
        background    = Color(0xFF289049),  // hue-500
        text          = Color.White,
        textAccent    = Color(0xFFC6E7D1),  // hue-100
        textSubdued   = Color(0xFF80CB99),  // hue-200
        icon          = Color(0xFF80CB99),  // hue-200
        border        = Color(0xFF196634),  // hue-600
        borderSubdued = Color(0xFF36A55D),  // hue-400
    )

    val DarkSoftBrand = OneTokenTheme(
        background    = Color(0xFF071F0F),  // hue-900
        text          = Color(0xFFC6E7D1),  // hue-100
        textAccent    = Color(0xFF80CB99),  // hue-200
        textSubdued   = Color(0xFF36A55D),  // hue-400
        icon          = Color(0xFF36A55D),  // hue-400
        border        = Color(0xFF0D3D1E),  // hue-800
        borderSubdued = Color(0xFF071F0F),  // hue-900
    )

    val LightSoftRed = OneTokenTheme(
        background    = Color(0xFFFEF0EE),
        text          = Color(0xFF5B1008),
        textAccent    = Color(0xFF9B241A),
        textSubdued   = Color(0xFFD03328),
        icon          = Color(0xFFF04438),
        border        = Color(0xFFF99C91),
        borderSubdued = Color(0xFFFDD4CF),
    )
}

// CompositionLocal — lets any composable read the theme
val LocalOneTokenTheme = compositionLocalOf { OneTokenThemes.LightSoftBrand }

@Composable
fun OneTokenProvider(
    theme: OneTokenTheme = OneTokenThemes.LightSoftBrand,
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(LocalOneTokenTheme provides theme) {
        content()
    }
}
```

```kotlin
// MainActivity.kt — set theme at root
setContent {
    OneTokenProvider(theme = OneTokenThemes.LightSoftBrand) {
        CardComponent()
    }
}
```

### The card component

```kotlin
// CardComponent.kt
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun CardComponent() {
    val t = LocalOneTokenTheme.current  // ← the seven roles

    Surface(
        color  = t.background,   // --background
        shape  = RoundedCornerShape(12.dp),
        modifier = Modifier
            .border(1.dp, t.border, RoundedCornerShape(12.dp))  // --border
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {

            // --text-accent: brand label
            Text(
                text       = "NEW ARRIVAL",
                fontSize   = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.8.sp,
                color      = t.textAccent,
            )

            // --text: primary title
            Text(
                text       = "Iced Brown Sugar Oat Espresso",
                fontSize   = 16.sp,
                fontWeight = FontWeight.SemiBold,
                lineHeight = 22.sp,
                color      = t.text,
            )

            // --border-subdued: divider
            Divider(color = t.borderSubdued, thickness = 1.dp)

            // --text-subdued: body copy
            Text(
                text      = "Blonde espresso shaken with oat milk and brown sugar syrup.",
                fontSize  = 13.sp,
                lineHeight = 20.sp,
                color     = t.textSubdued,
            )

            // --icon + --text-subdued: meta row
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Schedule,
                    contentDescription = null,
                    tint   = t.icon,           // --icon
                    modifier = Modifier.size(13.dp)
                )
                Text(
                    text     = "230 cal · Available now",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color    = t.textSubdued,  // --text-subdued
                )
            }

            // Button — same seven roles from CompositionLocal
            OutlinedButton(
                onClick = {},
                shape  = RoundedCornerShape(100.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = t.background,  // --background
                    contentColor   = t.text,         // --text
                ),
                border = BorderStroke(1.dp, t.border), // --border
            ) {
                Text("Order Now", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}
```

### Switching themes

```kotlin
// Same composable, different theme — override at any point in the tree
OneTokenProvider(theme = OneTokenThemes.LightStrongBrand) {
    CardComponent()  // full brand color background
}

OneTokenProvider(theme = OneTokenThemes.DarkSoftBrand) {
    CardComponent()  // dark mode
}

OneTokenProvider(theme = OneTokenThemes.LightSoftRed) {
    CardComponent()  // error surface
}
```

---

## What to check after running this

For each platform, verify:

- [ ] No hex values appear in the component file — only theme variable references
- [ ] Swapping the theme object or provider produces a visually correct result
- [ ] The divider uses `borderSubdued`, not `border`
- [ ] The button uses `background` + `border`, not a hardcoded brand color
- [ ] Meta text uses `textSubdued`, icon uses `icon` — they should match visually
- [ ] Disabled state is opacity 0.38, not a different color

If all six pass, One Token is working on that platform.

---

## Generating platform themes from a brand hex

Tell your AI:

> "Using One Token rules from SKILL.md, generate a complete
> theme object for [platform] using #YOUR_HEX as the brand
> color. Produce light-soft, light-strong, dark-soft, and
> dark-plain variants. Follow the palette scale rules in
> SKILL.md — 11 steps, brand color at 500."

The AI generates the theme object. You copy it into your
theme file. No manual hex work.

---

*One Token · MIT · github.com/matthewlew/one-token*
