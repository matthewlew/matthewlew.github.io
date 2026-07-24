import sys

with open('index.html', 'r') as f:
    content = f.read()

# 1. Add nav link
nav_target = '<li><a href="#inputs">Inputs & Badges</a></li>'
nav_replacement = nav_target + '\n    <li><a href="#accessibility">Accessibility</a></li>'
content = content.replace(nav_target, nav_replacement)

# 2. Add section
section_target = '<section id="guidance">'
section_replacement = '''<section id="accessibility">
    <div class="sec-header">
      <h2>Accessibility & Inclusion</h2>
      <p>A design system is a promise to build for everyone. We design for cognitive ease, visual accessibility, and global localization.</p>
    </div>
    
    <div class="demo-box">
      <h3 style="font-family:var(--th-mono); font-size:11px; text-transform:uppercase; color:var(--text-subdued); margin-bottom:16px; letter-spacing:0.1em;">Cognitive Load & Visual Accessibility</h3>
      <div class="grid-2">
        <div>
          <p style="font-size:14px; color:var(--text-subdued); margin-bottom:24px; line-height:1.6;">
            <strong>Anxiety & Cognitive Overload:</strong> Avoid aggressive countdown timers or high-stress red blocks that trigger anxiety.<br><br>
            <strong>Color Blindness (Deuteranomaly):</strong> ~1 in 12 men are color blind. Never rely on color alone to communicate state. Always pair semantic colors with iconography.
          </p>
          
          <div class="lds-banner banner-error" data-inspect="backgroundColor, color" data-inspect-state="Explicit (.banner-error)" data-a11y-warn="Missing icon! Relies purely on red color to convey error to users." style="margin-bottom:16px; cursor:crosshair;">
            <div>Payment failed. Try again.</div>
          </div>
          
          <div class="lds-banner banner-error" data-inspect="backgroundColor, color" data-inspect-state="Explicit (.banner-error)" style="cursor:crosshair;">
            <svg class="lds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>Payment failed. Try again.</div>
          </div>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:16px;">
          <button class="lds-btn emph-strong" data-inspect="padding" data-inspect-state="Explicit (.emph-strong)" data-a11y-warn="Missing aria-label on icon-only button." style="align-self:flex-start; cursor:crosshair;">
            <svg class="lds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </button>
          <p style="font-size:12px; color:var(--text-subdued);">^ Hover over the icon-only button above to see the Inspector flag the missing text label.</p>
        </div>
      </div>
    </div>
    
    <div class="demo-box" style="margin-top:32px;">
      <h3 style="font-family:var(--th-mono); font-size:11px; text-transform:uppercase; color:var(--text-subdued); margin-bottom:16px; letter-spacing:0.1em;">Internationalization & Overflow</h3>
      <p style="font-size:14px; color:var(--text-subdued); margin-bottom:24px; line-height:1.6; max-width:60ch;">
        UI components must not break when translated. German words can be 300% longer than English. Arabic and Hebrew require Right-to-Left (RTL) reading order support.
      </p>
      
      <div class="grid-2">
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="font-family:var(--th-mono); font-size:10px; color:var(--text-subdued);">Long Language (German)</div>
          
          <button class="lds-btn emph-strong" data-inspect="textOverflow" data-inspect-state="Truncated" data-a11y-warn="Text truncation limits accessibility for screen readers and localized text." style="max-width: 100%; cursor:crosshair;">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Donaudampfschifffahrtsgesellschaft</span>
          </button>
          
          <button class="lds-btn emph-plain" style="height: auto; white-space: normal; text-align:left;">
            Donaudampfschifffahrtsgesellschaft (Wrapped safely)
          </button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:16px;" dir="rtl">
          <div style="font-family:var(--th-mono); font-size:10px; color:var(--text-subdued);">Right-to-Left (Arabic)</div>
          <div class="lds-banner emph-soft">
            <svg class="lds-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <div>تم تطبيق الخصم بنجاح على حسابك.</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="guidance">'''
content = content.replace(section_target, section_replacement)

# 3. Update JS
js_target = '''        let stateStr = el.getAttribute('data-inspect-state') || 'Theme Driven';
        let html = `[${stateStr}]\\n\\n`;
        keys.forEach(k => {'''
js_replacement = '''        let stateStr = el.getAttribute('data-inspect-state') || 'Theme Driven';
        let a11yWarning = el.getAttribute('data-a11y-warn');
        let html = `[${stateStr}]\\n\\n`;
        
        if (a11yWarning) {
          html = `<span style="color:#ff6b6b; font-weight:bold;">[!] A11Y WARNING: ${a11yWarning}</span>\\n\\n` + html;
        }

        keys.forEach(k => {'''
content = content.replace(js_target, js_replacement)

with open('index_a11y.html', 'w') as f:
    f.write(content)
