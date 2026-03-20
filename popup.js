document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // VIEW MANAGEMENT — switch between main and sub-views
  // ============================================================
  const shareContainer = document.getElementById('share-container');
  const addressBookView = document.getElementById('address-book-view');

  function showView(view) {
    if (view === 'main') {
      shareContainer.classList.remove('hidden');
      addressBookView.classList.add('hidden');
    } else if (view === 'templates') {
      shareContainer.classList.add('hidden');
      addressBookView.classList.remove('hidden');
    }
  }

  // ============================================================
  // TOOLTIP LOGIC
  // ============================================================
  const removeDefaultTooltips = () => {
    document.querySelectorAll('.info-icon[title]').forEach(icon => {
      const title = icon.getAttribute('title');
      if (title && !icon.getAttribute('data-image-tooltip')) {
        icon.setAttribute('data-tooltip', title);
        icon.removeAttribute('title');
      }
    });
  };
  removeDefaultTooltips();

  function initializeTooltips() {
    removeDefaultTooltips();

    const textTooltipModal = document.createElement('div');
    textTooltipModal.className = 'tooltip-modal hidden';
    textTooltipModal.innerHTML = `
      <div class="tooltip-modal-content text-tooltip-content">
        <button class="tooltip-close-btn">✕</button>
        <div class="tooltip-text-content"></div>
      </div>`;
    document.body.appendChild(textTooltipModal);

    const imageTooltipModal = document.createElement('div');
    imageTooltipModal.className = 'tooltip-modal hidden';
    imageTooltipModal.innerHTML = `
      <div class="tooltip-modal-content">
        <button class="tooltip-close-btn">✕</button>
        <img class="tooltip-image" src="" alt="Info">
      </div>`;
    document.body.appendChild(imageTooltipModal);

    const closeText = textTooltipModal.querySelector('.tooltip-close-btn');
    const textContent = textTooltipModal.querySelector('.tooltip-text-content');
    closeText.addEventListener('click', () => textTooltipModal.classList.add('hidden'));
    textTooltipModal.addEventListener('click', (e) => {
      if (e.target === textTooltipModal) textTooltipModal.classList.add('hidden');
    });

    const closeImage = imageTooltipModal.querySelector('.tooltip-close-btn');
    const imageContent = imageTooltipModal.querySelector('.tooltip-image');
    closeImage.addEventListener('click', () => imageTooltipModal.classList.add('hidden'));
    imageTooltipModal.addEventListener('click', (e) => {
      if (e.target === imageTooltipModal) imageTooltipModal.classList.add('hidden');
    });

    document.querySelectorAll('.info-icon').forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = icon.getAttribute('data-tooltip');
        const imgSrc = icon.getAttribute('data-image-tooltip');
        if (imgSrc) {
          imageContent.src = imgSrc;
          imageTooltipModal.classList.remove('hidden');
        } else if (text) {
          textContent.textContent = text;
          textTooltipModal.classList.remove('hidden');
        }
      });
    });
  }
  initializeTooltips();

  // ============================================================
  // MAIN APPLICATION ELEMENTS
  // ============================================================
  const showAllGroupsBtn = document.getElementById('show-all-groups-button');
  const groupListDiv = document.getElementById('group-list');
  const groupCountSpan = document.getElementById('group-count');
  const selectAllCheckbox = document.getElementById('select-all-groups');
  const shareBtn = document.getElementById('share-button');
  const delayInput = document.getElementById('share-delay');
  const randomizeCheckbox = document.getElementById('randomize-delay');
  const postContentArea = document.getElementById('post-content');

  // Search
  const searchInput = document.getElementById('group-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');

  // Signature
  const signatureToggleBtn = document.getElementById('signature-toggle-btn');
  const signatureContainer = document.getElementById('signature-container');
  const signatureEnabledCheckbox = document.getElementById('signature-enabled');
  const signatureTextarea = document.getElementById('signature-text');
  const signatureSaveBtn = document.getElementById('signature-save-btn');

  // Save Post Preset button
  const savePostPresetBtn = document.getElementById('save-post-preset-btn');

  // ============================================================
  // HELPER: Update Count
  // ============================================================
  function updateGroupCount(totalCount) {
    if (!groupCountSpan) return;
    const checkedCount = groupListDiv ? groupListDiv.querySelectorAll('.group-checkbox:checked').length : 0;
    if (checkedCount > 0) {
      groupCountSpan.textContent = `${checkedCount} selected / ${totalCount} found`;
    } else {
      groupCountSpan.textContent = `${totalCount} groups found`;
    }
  }

  // ============================================================
  // HELPER: Render Groups
  // ============================================================
  let allGroups = [];

  function renderGroups(groups) {
    groupListDiv.innerHTML = '';

    if (!groups || groups.length === 0) {
      groupListDiv.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">No groups found</p>
          <p class="empty-hint">Open Facebook, click "Share" on a post, then click "Load All".</p>
        </div>`;
      updateGroupCount(0);
      return;
    }

    updateGroupCount(groups.length);

    groups.forEach((group, index) => {
      const groupItem = document.createElement('div');
      groupItem.className = 'group-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'group-checkbox styled-checkbox';
      checkbox.id = `group-${index}`;
      checkbox.value = group.id || group.name;

      const label = document.createElement('label');
      label.htmlFor = `group-${index}`;
      label.textContent = group.name;
      label.className = 'group-label';

      groupItem.appendChild(checkbox);
      groupItem.appendChild(label);
      groupListDiv.appendChild(groupItem);
    });

    // Update toggle-chosen button
    updateToggleChosenBtn();

    // Listen to checkbox changes to update selected count badge live
    groupListDiv.querySelectorAll('.group-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        updateGroupCount(allGroups.length);
        updateToggleChosenBtn();
      });
    });
  }

  // ============================================================
  // SEARCH & FILTER
  // ============================================================
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      if (searchClearBtn) {
        searchClearBtn.classList.toggle('hidden', query === '');
      }
      const items = groupListDiv.querySelectorAll('.group-item');
      items.forEach(item => {
        const label = item.querySelector('.group-label');
        if (label) {
          item.style.display = label.textContent.toLowerCase().includes(query) ? '' : 'none';
        }
      });
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchClearBtn.classList.add('hidden');
      groupListDiv.querySelectorAll('.group-item').forEach(item => item.style.display = '');
    });
  }

  // ============================================================
  // TOGGLE CHOSEN GROUPS BUTTON
  // ============================================================
  const toggleChosenBtn = document.getElementById('toggle-chosen-groups');
  const popupSavePresetBtn = document.getElementById('popup-save-preset-btn');
  let showingChosenOnly = false;

  function updateToggleChosenBtn() {
    const checkedCount = groupListDiv.querySelectorAll('.group-checkbox:checked').length;
    
    if (toggleChosenBtn) {
      if (checkedCount > 0) {
        toggleChosenBtn.classList.remove('hidden');
      } else {
        toggleChosenBtn.classList.add('hidden');
        showingChosenOnly = false;
        toggleChosenBtn.textContent = 'Show Chosen';
        toggleChosenBtn.classList.remove('active');
      }
    }

    if (popupSavePresetBtn) {
      if (checkedCount > 0) {
        popupSavePresetBtn.classList.remove('hidden');
      } else {
        popupSavePresetBtn.classList.add('hidden');
      }
    }
    updateGroupCount(allGroups.length);
  }

  if (toggleChosenBtn) {
    toggleChosenBtn.addEventListener('click', () => {
      showingChosenOnly = !showingChosenOnly;
      toggleChosenBtn.textContent = showingChosenOnly ? 'Show All' : 'Show Chosen';
      toggleChosenBtn.classList.toggle('active', showingChosenOnly);

      const items = groupListDiv.querySelectorAll('.group-item');
      items.forEach(item => {
        const cb = item.querySelector('.group-checkbox');
        if (showingChosenOnly) {
          item.style.display = (cb && cb.checked) ? '' : 'none';
        } else {
          item.style.display = '';
        }
      });
    });
  }

  // ============================================================
  // BUTTON: Load All Groups
  // ============================================================
  if (showAllGroupsBtn) {
    showAllGroupsBtn.addEventListener('click', () => {
      showAllGroupsBtn.textContent = '⏳ Loading...';
      showAllGroupsBtn.classList.add('loading');
      showAllGroupsBtn.disabled = true;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "get_groups" }, (response) => {
            showAllGroupsBtn.textContent = '📋 Load All';
            showAllGroupsBtn.classList.remove('loading');
            showAllGroupsBtn.disabled = false;

            if (chrome.runtime.lastError) {
              groupListDiv.innerHTML = '<p style="padding:10px; color:#ff6b6b;">Error: Could not connect to Facebook tab. Refresh the page.</p>';
              return;
            }

            if (response && response.groups) {
              allGroups = response.groups;
              renderGroups(response.groups);
              showAllGroupsBtn.classList.add('loaded');
              showAllGroupsBtn.textContent = `✅ ${response.groups.length} Groups Loaded`;
            } else {
              groupListDiv.innerHTML = '<p style="padding:10px;">Please open the "Share to Group" dialog on Facebook first.</p>';
            }
          });
        }
      });
    });
  }

  // ============================================================
  // CHECKBOX: Select All
  // ============================================================
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      document.querySelectorAll('.group-checkbox').forEach(cb => {
        // Only change visible items
        const item = cb.closest('.group-item');
        if (!item || item.style.display !== 'none') {
          cb.checked = e.target.checked;
        }
      });
      updateToggleChosenBtn();
    });
  }

  // Listen for individual checkbox changes to update toggle button
  groupListDiv.addEventListener('change', (e) => {
    if (e.target.classList.contains('group-checkbox')) {
      updateToggleChosenBtn();
    }
  });

  // ============================================================
  // SIGNATURE FUNCTIONALITY
  // ============================================================
  // Load saved signature
  chrome.storage.local.get(['signature_text', 'signature_enabled'], (result) => {
    if (signatureTextarea && result.signature_text) {
      signatureTextarea.value = result.signature_text;
    }
    if (signatureEnabledCheckbox && result.signature_enabled) {
      signatureEnabledCheckbox.checked = result.signature_enabled;
    }
  });

  if (signatureToggleBtn) {
    signatureToggleBtn.addEventListener('click', () => {
      if (signatureContainer) {
        signatureContainer.classList.toggle('hidden');
        signatureToggleBtn.textContent = signatureContainer.classList.contains('hidden')
          ? '✍️ Add Signature'
          : '✍️ Hide Signature';
      }
    });
  }

  if (signatureSaveBtn) {
    signatureSaveBtn.addEventListener('click', () => {
      const text = signatureTextarea ? signatureTextarea.value : '';
      const enabled = signatureEnabledCheckbox ? signatureEnabledCheckbox.checked : false;
      chrome.storage.local.set({ signature_text: text, signature_enabled: enabled }, () => {
        signatureSaveBtn.textContent = '✅ Saved!';
        setTimeout(() => { signatureSaveBtn.textContent = '💾 Save'; }, 2000);
      });
    });
  }

  // ============================================================
  // SAVE AS POST PRESET (Save post text as template)
  // ============================================================
  if (savePostPresetBtn) {
    savePostPresetBtn.addEventListener('click', () => {
      const postText = postContentArea ? postContentArea.value.trim() : '';
      if (!postText) {
        alert('Please enter some post content first before saving as a template!');
        return;
      }
      const name = prompt('Enter a name for this post template:', '');
      if (!name || !name.trim()) return;

      chrome.storage.local.get(['postTemplates'], (result) => {
        const postTemplates = result.postTemplates || {};
        if (postTemplates[name.trim()]) {
          if (!confirm(`A template named "${name.trim()}" already exists. Replace it?`)) return;
        }
        postTemplates[name.trim()] = postText;
        chrome.storage.local.set({ postTemplates }, () => {
          savePostPresetBtn.textContent = '✅ Saved!';
          setTimeout(() => { savePostPresetBtn.textContent = '💾 Save as Preset'; }, 2000);
        });
      });
    });
  }

  // ============================================================
  // BUTTON: Share to Groups
  // ============================================================
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const selectedGroups = [];
      document.querySelectorAll('.group-checkbox:checked').forEach(cb => {
        const label = cb.nextElementSibling;
        if (label) selectedGroups.push(label.textContent);
      });

      if (selectedGroups.length === 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'trigger_page_share' }, (response) => {
              if (chrome.runtime.lastError || !response || !response.success) {
                alert('Please select at least one group (either in this popup or on the page).');
              } else {
                window.close();
              }
            });
          }
        });
        return;
      }

      // Get signature
      let postSignature = null;
      if (signatureEnabledCheckbox && signatureEnabledCheckbox.checked && signatureTextarea) {
        postSignature = signatureTextarea.value.trim() || null;
      }

      const message = postContentArea ? postContentArea.value : '';
      const delay = delayInput ? parseInt(delayInput.value) : 30;
      const randomize = randomizeCheckbox ? randomizeCheckbox.checked : false;

      // Repeat controls
      const repeatCountInput = document.getElementById('repeat-count');
      const repeatDelayMinInput = document.getElementById('repeat-delay-min');
      const repeatDelaySecInput = document.getElementById('repeat-delay-sec');
      
      const repeatCount = repeatCountInput ? parseInt(repeatCountInput.value) || 1 : 1;
      const repeatDelayMin = repeatDelayMinInput ? parseInt(repeatDelayMinInput.value) || 0 : 0;
      const repeatDelaySec = repeatDelaySecInput ? parseInt(repeatDelaySecInput.value) || 0 : 0;
      const repeatDelayTotalMs = ((repeatDelayMin * 60) + repeatDelaySec) * 1000;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "share_to_groups",
            groups: selectedGroups,
            postContent: message,
            postSignature: postSignature,
            delay: delay,
            randomizeDelay: randomize,
            repeatCount: repeatCount,
            repeatDelayMs: repeatDelayTotalMs
          });
          window.close();
        }
      });
    });
  }

  // ============================================================
  // HEADER ICON: 📝 Saved Post Templates (Address Book)
  // ============================================================
  const addressBookIcon = document.getElementById('addressBookIcon');
  if (addressBookIcon) {
    addressBookIcon.addEventListener('click', () => {
      showView('templates');  // Show view first so DOM elements are visible
      // Small delay to ensure DOM is rendered before init tries to find elements
      setTimeout(() => {
        if (typeof initializeAddressBook === 'function') {
          initializeAddressBook(showView);
        }
      }, 20);
    });
  }

  // ============================================================
  // HEADER ICON: ⚡ 1 Click Share Templates
  // ============================================================
  const oneClickTemplatesIcon = document.getElementById('oneClickTemplatesIcon');
  if (oneClickTemplatesIcon) {
    oneClickTemplatesIcon.addEventListener('click', () => {
      // Initialize one-click templates and open manager
      if (typeof initializeOneClickTemplates === 'function') {
        initializeOneClickTemplates(showView);
      }
      // Open the manager modal directly
      const managerModal = document.getElementById('one-click-manager-modal');
      if (managerModal) {
        managerModal.classList.remove('hidden');
        // Populate templates list
        if (window.oneClickTemplates && window.oneClickTemplates.showManagerModal) {
          window.oneClickTemplates.showManagerModal();
        }
      }
    });
  }

  // ============================================================
  // HEADER ICON: 📖 Group Presets Manager
  // ============================================================
  const groupPresetsIcon = document.getElementById('groupPresetsIcon');
  if (groupPresetsIcon) {
    groupPresetsIcon.addEventListener('click', () => {
      openGroupPresetsManager();
    });
  }

  function openGroupPresetsManager() {
    const modal = document.getElementById('presets-manager-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    renderPresetsManager();
  }

  function renderPresetsManager() {
    const container = document.getElementById('presets-list-container');
    const emptyState = document.querySelector('.empty-presets-state');
    if (!container) return;

    chrome.storage.local.get(['groupPresets'], (result) => {
      const presets = result.groupPresets || [];

      if (presets.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }
      if (emptyState) emptyState.classList.add('hidden');

      container.innerHTML = presets.map(preset => {
        const createdDate = new Date(preset.createdAt).toLocaleDateString();
        return `
          <div class="preset-card" data-preset-id="${preset.id}" style="
            background: #ffffff;
            border: 1px solid rgba(30,178,255,0.3);
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            transition: all 0.2s;
          ">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:18px;">📖</span>
                <span style="color:#1c1e21; font-size:14px; font-weight:700;">${preset.name}</span>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="apply-preset-btn" data-preset-id="${preset.id}" style="
                  background:linear-gradient(135deg,#1eb2ff 0%,#00d4ff 100%);
                  border:none; color:#fff; padding:5px 12px; border-radius:8px;
                  font-size:12px; font-weight:700; cursor:pointer;">✓ Apply</button>
                <button class="delete-preset-btn" data-preset-id="${preset.id}" style="
                  background:rgba(255,59,48,0.15); border:1px solid rgba(255,59,48,0.3);
                  color:#e02424; padding:5px 10px; border-radius:8px;
                  font-size:12px; font-weight:600; cursor:pointer;">🗑️</button>
              </div>
            </div>
            <div style="color:#65676b; font-size:12px; display:flex; gap:12px;">
              <span>🎯 ${preset.groups.length} group${preset.groups.length !== 1 ? 's' : ''}</span>
              <span>📅 ${createdDate}</span>
            </div>
            <div style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">
              ${preset.groups.slice(0, 5).map(g => `<span style="background:#e7f3ff; border:1px solid #cbe4fd; color:#1877f2; padding:3px 8px; border-radius:10px; font-size:11px; font-weight:500;">${g}</span>`).join('')}
              ${preset.groups.length > 5 ? `<span style="color:#65676b; background:#f0f2f5; font-size:11px; padding:3px 8px; border-radius:10px;">+${preset.groups.length - 5} more</span>` : ''}
            </div>
          </div>`;
      }).join('');

      // Attach Apply button listeners
      container.querySelectorAll('.apply-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const presetId = btn.getAttribute('data-preset-id');
          const preset = presets.find(p => p.id === presetId);
          if (!preset) return;

          // Load all groups then select preset groups
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;
            chrome.tabs.sendMessage(tabs[0].id, { type: 'get_groups' }, (response) => {
              const modal = document.getElementById('presets-manager-modal');
              if (modal) modal.classList.add('hidden');

              if (response && response.groups) {
                allGroups = response.groups;
                renderGroups(response.groups);
                // Pre-select groups from preset
                setTimeout(() => {
                  document.querySelectorAll('.group-checkbox').forEach(cb => {
                    const label = cb.nextElementSibling;
                    if (label && preset.groups.includes(label.textContent)) {
                      cb.checked = true;
                    }
                  });
                  updateGroupCount(response.groups.length);
                  updateToggleChosenBtn();
                }, 100);
              }
            });
          });
        });
      });

      // Attach Delete button listeners
      container.querySelectorAll('.delete-preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const presetId = btn.getAttribute('data-preset-id');
          const preset = presets.find(p => p.id === presetId);
          if (!preset) return;
          if (!confirm(`Delete preset "${preset.name}"?`)) return;

          const updated = presets.filter(p => p.id !== presetId);
          chrome.storage.local.set({ groupPresets: updated }, () => {
            renderPresetsManager();
          });
        });
      });
    });
  }

  // Close presets manager modal
  const closePresetsManager = document.getElementById('close-presets-manager');
  if (closePresetsManager) {
    closePresetsManager.addEventListener('click', () => {
      const modal = document.getElementById('presets-manager-modal');
      if (modal) modal.classList.add('hidden');
    });
  }

  const presetsManagerModal = document.getElementById('presets-manager-modal');
  if (presetsManagerModal) {
    presetsManagerModal.addEventListener('click', (e) => {
      if (e.target === presetsManagerModal) presetsManagerModal.classList.add('hidden');
    });
  }

  // ============================================================
  // SAVE PRESET MODAL (after clicking "Share to Selected Groups")
  // ============================================================
  const savePresetModal = document.getElementById('save-preset-modal');
  const closeSavePresetModal = document.getElementById('close-save-preset-modal');
  const presetAnswerNo = document.getElementById('preset-answer-no');
  const presetAnswerYes = document.getElementById('preset-answer-yes');
  const presetQuestionView = document.getElementById('preset-question-view');
  const presetFormView = document.getElementById('preset-form-view');
  const presetNameInput = document.getElementById('preset-name');
  const cancelSavePreset = document.getElementById('cancel-save-preset');
  const confirmSavePreset = document.getElementById('confirm-save-preset');
  const presetGroupsCountQuestion = document.getElementById('preset-groups-count-question');
  const presetGroupsListQuestion = document.getElementById('preset-groups-list-question');
  const presetGroupsCount = document.getElementById('preset-groups-count');
  const presetGroupsList = document.getElementById('preset-groups-list');

  let pendingPresetGroups = [];

  function openSavePresetModal(groups, skipQuestion = false) {
    pendingPresetGroups = groups;
    if (presetGroupsCountQuestion) presetGroupsCountQuestion.textContent = `${groups.length} groups selected`;
    if (presetGroupsListQuestion) {
      presetGroupsListQuestion.innerHTML = groups.slice(0, 8).map(g =>
        `<div style="padding:3px 0; color:rgba(255,255,255,0.8); font-size:12px;">• ${g}</div>`
      ).join('') + (groups.length > 8 ? `<div style="color:rgba(255,255,255,0.5); font-size:11px;">... and ${groups.length - 8} more</div>` : '');
    }
    if (presetGroupsCount) presetGroupsCount.textContent = `${groups.length} groups selected`;
    if (presetGroupsList) {
      presetGroupsList.innerHTML = groups.slice(0, 8).map(g =>
        `<div style="padding:3px 0; color:rgba(255,255,255,0.8); font-size:12px;">• ${g}</div>`
      ).join('') + (groups.length > 8 ? `<div style="color:rgba(255,255,255,0.5); font-size:11px;">... and ${groups.length - 8} more</div>` : '');
    }

    if (skipQuestion) {
      // Show form view directly
      if (presetQuestionView) presetQuestionView.classList.add('hidden');
      if (presetFormView) presetFormView.classList.remove('hidden');
    } else {
      // Show question view
      if (presetQuestionView) presetQuestionView.classList.remove('hidden');
      if (presetFormView) presetFormView.classList.add('hidden');
    }
    
    if (savePresetModal) savePresetModal.classList.remove('hidden');
  }

  const popupSavePresetBtnEl = document.getElementById('popup-save-preset-btn');
  if (popupSavePresetBtnEl) {
    popupSavePresetBtnEl.addEventListener('click', () => {
      const selectedGroups = [];
      document.querySelectorAll('.group-checkbox:checked').forEach(cb => {
        const label = cb.nextElementSibling;
        if (label) selectedGroups.push(label.textContent);
      });

      if (selectedGroups.length === 0) {
        alert('Please select at least one group first.');
        return;
      }

      openSavePresetModal(selectedGroups, true); // true = skip question
    });
  }

  if (closeSavePresetModal) {
    closeSavePresetModal.addEventListener('click', () => {
      if (savePresetModal) savePresetModal.classList.add('hidden');
    });
  }
  if (presetAnswerNo) {
    presetAnswerNo.addEventListener('click', () => {
      if (savePresetModal) savePresetModal.classList.add('hidden');
    });
  }
  if (presetAnswerYes) {
    presetAnswerYes.addEventListener('click', () => {
      if (presetQuestionView) presetQuestionView.classList.add('hidden');
      if (presetFormView) presetFormView.classList.remove('hidden');
    });
  }
  if (cancelSavePreset) {
    cancelSavePreset.addEventListener('click', () => {
      if (savePresetModal) savePresetModal.classList.add('hidden');
    });
  }
  if (confirmSavePreset) {
    confirmSavePreset.addEventListener('click', () => {
      const name = presetNameInput ? presetNameInput.value.trim() : '';
      if (!name) {
        alert('Please enter a name for your Group Preset!');
        if (presetNameInput) presetNameInput.focus();
        return;
      }

      chrome.storage.local.get(['groupPresets'], (result) => {
        const presets = result.groupPresets || [];
        const newPreset = {
          id: Date.now().toString(),
          name: name,
          groups: pendingPresetGroups,
          createdAt: new Date().toISOString()
        };
        presets.push(newPreset);
        chrome.storage.local.set({ groupPresets: presets }, () => {
          if (savePresetModal) savePresetModal.classList.add('hidden');
          if (presetNameInput) presetNameInput.value = '';
          alert(`✅ Group Preset "${name}" saved!`);
        });
      });
    });
  }

  // ============================================================
  // HEADER ICON: ⚙️ Settings
  // ============================================================
  const settingsIcon = document.getElementById('settingsIcon');
  const settingsPanel = createSettingsPanel();
  document.querySelector('.wrapper').appendChild(settingsPanel);

  function createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'hidden';
    panel.style.cssText = `
      position: absolute;
      top: 60px;
      right: 12px;
      background: linear-gradient(135deg, #0d2137 0%, #0a1628 100%);
      border: 1px solid rgba(30,178,255,0.3);
      border-radius: 14px;
      padding: 16px;
      width: 240px;
      z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;
    panel.innerHTML = `
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span style="color:#1eb2ff; font-size:14px; font-weight:700;">⚙️ Settings</span>
        <button id="close-settings-panel" style="background:none; border:none; color:rgba(255,255,255,0.6); font-size:18px; cursor:pointer; line-height:1;">✕</button>
      </div>

      <!-- Delay -->
      <div style="margin-bottom:11px;">
        <label style="color:rgba(255,255,255,0.8); font-size:11px; font-weight:700; display:block; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.4px;">🕐 Default Delay (seconds)</label>
        <input type="number" id="settings-delay" min="5" value="30" style="
          width:100%; padding:7px 10px; border:1px solid rgba(30,178,255,0.3);
          border-radius:8px; background:rgba(0,12,35,0.6); color:#fff;
          font-size:13px; box-sizing:border-box; outline:none;">
      </div>

      <!-- Randomize -->
      <div style="margin-bottom:14px; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="settings-randomize" checked style="width:16px; height:16px; accent-color:#1eb2ff; cursor:pointer;">
        <label for="settings-randomize" style="color:rgba(255,255,255,0.8); font-size:12px; cursor:pointer; font-weight:600;">Randomize Delay</label>
      </div>

      <!-- Save Settings -->
      <button id="save-settings-btn" style="
        width:100%; background:linear-gradient(135deg,#1eb2ff 0%,#00d4ff 100%);
        border:none; color:#fff; padding:9px; border-radius:8px;
        font-size:13px; font-weight:700; cursor:pointer; margin-bottom:14px;
        box-shadow:0 3px 10px rgba(30,178,255,0.3);">💾 Save Settings</button>

      <!-- Divider -->
      <div style="height:1px; background:rgba(255,255,255,0.08); margin-bottom:14px;"></div>

      <!-- Backup & Restore Section -->
      <div style="margin-bottom:6px;">
        <div style="color:rgba(255,255,255,0.7); font-size:11px; font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.4px;">
          💾 Backup &amp; Restore
        </div>
        <p style="color:rgba(255,255,255,0.4); font-size:10.5px; margin:0 0 10px 0; line-height:1.5;">
          Export your data to keep it safe. Import to restore after reinstall.
        </p>

        <!-- Export Button -->
        <button id="export-data-btn" style="
          width:100%; background:rgba(34,197,94,0.15);
          border:1.5px solid rgba(34,197,94,0.4);
          color:#4ade80; padding:9px; border-radius:9px;
          font-size:12px; font-weight:700; cursor:pointer;
          margin-bottom:7px; display:flex; align-items:center;
          justify-content:center; gap:6px; box-sizing:border-box;
          transition:background 0.2s;">
          📤 Export Backup (.json)
        </button>

        <!-- Import Button -->
        <label id="import-label-btn" style="
          display:flex; align-items:center; justify-content:center; gap:6px;
          width:100%; background:rgba(251,146,60,0.15);
          border:1.5px solid rgba(251,146,60,0.4);
          color:#fb923c; padding:9px; border-radius:9px;
          font-size:12px; font-weight:700; cursor:pointer;
          box-sizing:border-box; transition:background 0.2s;">
          📥 Import Backup (.json)
          <input type="file" id="import-data-file" accept=".json" style="display:none;">
        </label>

        <div id="backup-status" style="
          display:none; margin-top:8px; padding:7px 10px;
          border-radius:8px; font-size:11.5px; font-weight:600;
          text-align:center;"></div>
      </div>

      <!-- Divider -->
      <div style="height:1px; background:rgba(255,255,255,0.08); margin:14px 0;"></div>

      <!-- Danger Zone -->
      <div style="padding:10px; background:rgba(255,59,48,0.08); border:1px solid rgba(255,59,48,0.2); border-radius:9px;">
        <div style="color:rgba(255,100,100,0.9); font-size:11px; font-weight:700; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.3px;">⚠️ Danger Zone</div>
        <button id="clear-all-data-btn" style="
          width:100%; background:rgba(255,59,48,0.15); border:1px solid rgba(255,59,48,0.4);
          color:#ff6b6b; padding:8px; border-radius:8px; font-size:12px;
          font-weight:600; cursor:pointer;">🗑️ Clear All Saved Data</button>
      </div>
    `;
    return panel;
  }

  // ─── Export Logic ───────────────────────────────────────────
  function exportAllData() {
    chrome.storage.local.get(null, (allData) => {
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const filename = `group-share-backup-${dateStr}.json`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showBackupStatus('✅ Backup downloaded!', '#4ade80', 'rgba(34,197,94,0.15)');
    });
  }

  // ─── Import Logic ────────────────────────────────────────────
  function importDataFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Validate it has at least one recognizable key
        const validKeys = ['groupPresets', 'postTemplates', 'oneClickTemplates', 'signature_text', 'settings_delay', 'aiSystemPrompt'];
        const hasValidData = validKeys.some(k => data[k] !== undefined);

        if (!hasValidData) {
          showBackupStatus('❌ Invalid backup file', '#f87171', 'rgba(239,68,68,0.15)');
          return;
        }

        if (!confirm(`Import backup?\n\nThis will MERGE with your current data (existing items won't be deleted).\n\nFound:\n• ${(data.groupPresets||[]).length} Group Presets\n• ${Object.keys(data.postTemplates||{}).length} Post Templates\n• ${(data.oneClickTemplates||[]).length} 1-Click Templates\n\nContinue?`)) return;

        // Merge strategy: combine arrays, merge objects
        chrome.storage.local.get(null, (current) => {
          const merged = { ...current };

          // Merge groupPresets (avoid duplicates by id)
          if (data.groupPresets) {
            const existingIds = new Set((current.groupPresets || []).map(p => p.id));
            const newPresets = data.groupPresets.filter(p => !existingIds.has(p.id));
            merged.groupPresets = [...(current.groupPresets || []), ...newPresets];
          }

          // Merge postTemplates (object — new keys added, existing not overwritten)
          if (data.postTemplates) {
            merged.postTemplates = { ...data.postTemplates, ...(current.postTemplates || {}) };
          }

          // Merge oneClickTemplates (by id)
          if (data.oneClickTemplates) {
            const existingIds = new Set((current.oneClickTemplates || []).map(t => t.id));
            const newTemplates = data.oneClickTemplates.filter(t => !existingIds.has(t.id));
            merged.oneClickTemplates = [...(current.oneClickTemplates || []), ...newTemplates];
          }

          // Restore other settings only if not already set
          ['signature_text', 'signature_enabled', 'settings_delay', 'settings_randomize', 'aiSystemPrompt'].forEach(key => {
            if (data[key] !== undefined && current[key] === undefined) {
              merged[key] = data[key];
            }
          });

          chrome.storage.local.set(merged, () => {
            showBackupStatus('✅ Data imported successfully!', '#4ade80', 'rgba(34,197,94,0.15)');
            setTimeout(() => location.reload(), 1500);
          });
        });

      } catch (err) {
        showBackupStatus('❌ Invalid JSON file', '#f87171', 'rgba(239,68,68,0.15)');
      }
    };
    reader.readAsText(file);
  }

  function showBackupStatus(msg, color, bg) {
    const el = document.getElementById('backup-status');
    if (!el) return;
    el.style.display = 'block';
    el.style.color = color;
    el.style.background = bg;
    el.style.border = `1px solid ${color}40`;
    el.textContent = msg;
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  }


  // Load saved settings into the panel
  chrome.storage.local.get(['settings_delay', 'settings_randomize'], (result) => {
    const settingsDelay = document.getElementById('settings-delay');
    const settingsRandomize = document.getElementById('settings-randomize');
    if (settingsDelay && result.settings_delay) settingsDelay.value = result.settings_delay;
    if (settingsRandomize && result.settings_randomize !== undefined) settingsRandomize.checked = result.settings_randomize;
  });

  if (settingsIcon) {
    settingsIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsPanel.classList.toggle('hidden');
    });
  }

  document.getElementById('close-settings-panel').addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
  });

  document.getElementById('save-settings-btn').addEventListener('click', () => {
    const delay = parseInt(document.getElementById('settings-delay').value) || 30;
    const randomize = document.getElementById('settings-randomize').checked;

    if (delayInput) delayInput.value = delay;
    if (randomizeCheckbox) randomizeCheckbox.checked = randomize;

    chrome.storage.local.set({ settings_delay: delay, settings_randomize: randomize }, () => {
      const btn = document.getElementById('save-settings-btn');
      btn.textContent = '✅ Saved!';
      setTimeout(() => {
        btn.textContent = '💾 Save Settings';
        settingsPanel.classList.add('hidden');
      }, 1500);
    });
  });

  // Export button
  document.getElementById('export-data-btn').addEventListener('click', () => {
    exportAllData();
  });

  // Import button — file input change
  document.getElementById('import-data-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importDataFromFile(file);
      e.target.value = ''; // Reset so same file can be re-imported
    }
  });

  document.getElementById('clear-all-data-btn').addEventListener('click', () => {
    if (confirm('⚠️ This will delete ALL saved templates, presets, and settings. Are you sure?')) {
      chrome.storage.local.clear(() => {
        alert('✅ All data cleared!');
        settingsPanel.classList.add('hidden');
        location.reload();
      });
    }
  });

  // Close settings panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsIcon) {
      settingsPanel.classList.add('hidden');
    }
  });

  // ============================================================
  // LINK TO PRESET FUNCTIONALITY
  // ============================================================
  const openLinkToPresetBtn = document.getElementById('open-link-to-preset-btn');
  const linkToPresetModal = document.getElementById('link-to-preset-modal');
  const closeLinkToPreset = document.getElementById('close-link-to-preset');
  const fetchPresetLinksBtn = document.getElementById('fetch-preset-links-btn');
  const presetLinksInput = document.getElementById('preset-links-input');
  const presetScrapedNamesContainer = document.getElementById('preset-scraped-names-container');
  const presetNamesInput = document.getElementById('preset-names-input');
  const saveLinkPresetBtn = document.getElementById('save-link-preset-btn');
  const linkPresetNameInput = document.getElementById('link-preset-name-input');
  const linkPresetSelect = document.getElementById('link-preset-select');

  if (linkPresetSelect) {
    linkPresetSelect.addEventListener('change', (e) => {
      if (e.target.value === 'new_preset') {
        if (linkPresetNameInput) linkPresetNameInput.style.display = 'block';
      } else {
        if (linkPresetNameInput) linkPresetNameInput.style.display = 'none';
      }
    });
  }

  if (openLinkToPresetBtn) {
    openLinkToPresetBtn.addEventListener('click', () => {
      document.getElementById('presets-manager-modal')?.classList.add('hidden');
      if (linkToPresetModal) {
        linkToPresetModal.classList.remove('hidden');
        presetLinksInput.value = '';
        presetNamesInput.value = '';
        if (linkPresetNameInput) {
          linkPresetNameInput.value = '';
          linkPresetNameInput.style.display = 'block';
        }
        if (linkPresetSelect) linkPresetSelect.value = 'new_preset';
        presetScrapedNamesContainer.classList.add('hidden');

        chrome.storage.local.get(['groupPresets'], (result) => {
          const presets = result.groupPresets || [];
          if (linkPresetSelect) {
            linkPresetSelect.innerHTML = '<option value="new_preset">➕ Create New Preset</option>';
            presets.forEach(p => {
              const opt = document.createElement('option');
              opt.value = p.id;
              opt.textContent = `📁 Append to: ${p.name}`;
              linkPresetSelect.appendChild(opt);
            });
          }
        });
      }
    });
  }

  if (closeLinkToPreset) {
    closeLinkToPreset.addEventListener('click', () => {
      if (linkToPresetModal) linkToPresetModal.classList.add('hidden');
    });
  }

  async function fetchFacebookTitle(url) {
    try {
      const res = await fetch(url.trim(), { credentials: 'omit' }); // Omit credentials to avoid FB auto-redirect to mobile sometimes, or keep include if needed
      const text = await res.text();
      const titleMatch = text.match(/<title>(.*?)<\/title>/);
      if (titleMatch && titleMatch[1]) {
        let txt = document.createElement('textarea');
        txt.innerHTML = titleMatch[1];
        let cleanTitle = txt.value.replace(/ \| Facebook$/i, '').replace(/ - Facebook$/i, '').trim();
        if (cleanTitle && cleanTitle.toLowerCase() !== 'facebook') return cleanTitle;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  if (fetchPresetLinksBtn) {
    fetchPresetLinksBtn.addEventListener('click', async () => {
      const linksText = presetLinksInput.value.trim();
      if (!linksText) {
        alert('Please paste some links first.');
        return;
      }

      const links = linksText.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'));
      if (links.length === 0) {
        alert('No valid links found. Please ensure each link starts with http');
        return;
      }

      fetchPresetLinksBtn.textContent = '⏳ Fetching Names...';
      fetchPresetLinksBtn.disabled = true;

      const resultsTbody = document.getElementById('extraction-results-tbody');
      const summaryText = document.getElementById('extraction-summary-text');
      if (resultsTbody) resultsTbody.innerHTML = '';
      if (summaryText) summaryText.textContent = `0/${links.length} Extracted`;

      let successCount = 0;
      let failedCount = 0;

      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (summaryText) summaryText.textContent = `Extracting ${i+1}/${links.length}...`;
        const title = await fetchFacebookTitle(link);
        
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        
        const tdLink = document.createElement('td');
        tdLink.style.padding = '8px 10px';
        tdLink.style.fontSize = '11px';
        tdLink.style.maxWidth = '100px';
        tdLink.style.overflow = 'hidden';
        tdLink.style.textOverflow = 'ellipsis';
        tdLink.style.whiteSpace = 'nowrap';
        tdLink.style.color = 'rgba(255,255,255,0.6)';
        
        try {
          const urlObj = new URL(link);
          const parts = urlObj.pathname.split('/').filter(Boolean);
          const groupId = parts[parts.indexOf('groups') + 1] || link.replace('https://','').substring(0, 20)+'...';
          tdLink.textContent = groupId;
          tdLink.title = link;
        } catch(e) {
          tdLink.textContent = 'Link';
        }

        const tdName = document.createElement('td');
        tdName.style.padding = '6px 10px';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'extracted-group-name-input';
        input.style.width = '100%';
        input.style.background = 'rgba(0,0,0,0.3)';
        input.style.border = '1px solid rgba(255,255,255,0.2)';
        input.style.borderRadius = '4px';
        input.style.color = '#fff';
        input.style.padding = '5px 8px';
        input.style.fontSize = '12px';
        input.style.boxSizing = 'border-box';
        
        if (title) {
          input.value = title;
          input.style.borderColor = 'rgba(74,222,128,0.4)';
          successCount++;
        } else {
          input.value = '';
          input.placeholder = 'Type name here...';
          input.style.borderColor = 'rgba(248,113,113,0.6)';
          failedCount++;
        }
        
        tdName.appendChild(input);
        tr.appendChild(tdLink);
        tr.appendChild(tdName);
        if (resultsTbody) resultsTbody.appendChild(tr);
      }

      if (summaryText) {
        summaryText.innerHTML = `<span style="color:#4ade80">✅ ${successCount}</span> | <span style="color:#f87171">❌ ${failedCount}</span>`;
      }
      
      presetScrapedNamesContainer.classList.remove('hidden');
      fetchPresetLinksBtn.textContent = '✨ Extract Group Names';
      fetchPresetLinksBtn.disabled = false;
    });
  }

  if (saveLinkPresetBtn) {
    saveLinkPresetBtn.addEventListener('click', () => {
      const selectedAction = linkPresetSelect ? linkPresetSelect.value : 'new_preset';
      const presetName = linkPresetNameInput ? linkPresetNameInput.value.trim() : '';
      
      if (selectedAction === 'new_preset' && !presetName) {
        alert('Please enter a name for your new preset.');
        return;
      }

      const inputs = document.querySelectorAll('.extracted-group-name-input');
      const finalGroups = [];
      inputs.forEach(inp => {
        const val = inp.value.trim();
        if (val.length > 0) finalGroups.push(val);
      });

      if (finalGroups.length === 0) {
        alert('No valid group names found to save.');
        return;
      }

      chrome.storage.local.get(['groupPresets'], (result) => {
        let presets = result.groupPresets || [];
        
        if (selectedAction === 'new_preset') {
          // Create new preset
          const newPreset = {
            id: Date.now().toString(),
            name: presetName,
            groups: finalGroups,
            createdAt: new Date().toISOString()
          };
          presets.push(newPreset);
          saveAndNotify(`✅ Preset "${presetName}" saved with ${finalGroups.length} groups!`);
        } else {
          // Append to existing preset
          let updatedName = "";
          presets = presets.map(p => {
            if (p.id === selectedAction) {
              updatedName = p.name;
              // Append new groups and remove duplicates
              const combinedGroups = [...p.groups, ...finalGroups];
              p.groups = [...new Set(combinedGroups)];
            }
            return p;
          });
          saveAndNotify(`✅ Added ${finalGroups.length} new groups to "${updatedName}"!`);
        }
        
        function saveAndNotify(msg) {
          chrome.storage.local.set({ groupPresets: presets }, () => {
            alert(msg);
            linkToPresetModal.classList.add('hidden');
            // Re-open presets modal
            const presetsManagerModal = document.getElementById('presets-manager-modal');
            if (presetsManagerModal) {
              presetsManagerModal.classList.remove('hidden');
              renderPresetsManager();
            }
          });
        }
      });
    });
  }

  // ============================================================
  // INITIALIZE MODULES
  // ============================================================
  // Initialize 1 Click Templates module
  if (typeof initializeOneClickTemplates === 'function') {
    initializeOneClickTemplates(showView);
  }

  // Close one-click modals
  const closeCreateOneClick = document.getElementById('close-create-one-click');
  if (closeCreateOneClick) {
    closeCreateOneClick.addEventListener('click', () => {
      document.getElementById('create-one-click-modal')?.classList.add('hidden');
    });
  }

  const closeOneClickManager = document.getElementById('close-one-click-manager');
  if (closeOneClickManager) {
    closeOneClickManager.addEventListener('click', () => {
      document.getElementById('one-click-manager-modal')?.classList.add('hidden');
    });
  }

  // ============================================================
  // ACTIVITY LOG FUNCTIONALITY
  // ============================================================
  const activityLogIcon = document.getElementById('activityLogIcon');
  const activityLogModal = document.getElementById('activity-log-modal');
  const closeActivityLog = document.getElementById('close-activity-log');
  const logEntriesContainer = document.getElementById('log-entries');
  const clearLogsBtn = document.getElementById('clear-logs-btn');
  const refreshLogsBtn = document.getElementById('refresh-logs-btn');

  function renderActivityLogs() {
    if (!logEntriesContainer) return;
    
    chrome.storage.local.get(['activityLogs'], (result) => {
      const logs = result.activityLogs || [];
      if (logs.length === 0) {
        logEntriesContainer.innerHTML = '<p style="text-align: center; color: #9ca3af; padding: 20px;">No logs found.</p>';
        return;
      }

      const successCount = logs.filter(l => l.status === 'success').length;
      const failCount = logs.filter(l => l.status === 'failed').length;
      
      // Calculate total time duration
      let timeStr = '0s';
      if (logs.length > 1) {
        const sortedById = [...logs].sort((a,b) => a.id - b.id);
        const diffMs = sortedById[sortedById.length - 1].id - sortedById[0].id;
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        
        if (hours > 0) {
          timeStr = `${hours}h ${mins}m ${secs}s`;
        } else if (mins > 0) {
          timeStr = `${mins}m ${secs}s`;
        } else {
          timeStr = `${secs}s`;
        }
      }

      // Summary Header
      let html = `
        <div style="display: flex; justify-content: space-around; padding: 10px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px;">
          <div style="text-align:center;"><span style="color:#4ade80; font-size:16px; font-weight:bold;">${successCount}</span><br><span style="font-size:10px; color:#aaa;">SUCCESS</span></div>
          <div style="text-align:center;"><span style="color:#f87171; font-size:16px; font-weight:bold;">${failCount}</span><br><span style="font-size:10px; color:#aaa;">FAILED</span></div>
          <div style="text-align:center;"><span style="color:#1eb2ff; font-size:16px; font-weight:bold;">${timeStr}</span><br><span style="font-size:10px; color:#aaa;">DURATION</span></div>
          <div style="text-align:center;"><span style="color:#fff; font-size:16px; font-weight:bold;">${logs.length}</span><br><span style="font-size:10px; color:#aaa;">TOTAL</span></div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #fff;">
          <thead>
            <tr style="background: rgba(30,178,255,0.1); text-align: left;">
              <th style="padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">Run</th>
              <th style="padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">Status</th>
              <th style="padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">Group Info</th>
              <th style="padding: 6px; border-bottom: 1px solid rgba(255,255,255,0.1);">Time</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Sort logs by newest first
      const sortedLogs = [...logs].sort((a, b) => b.id - a.id);
      
      html += sortedLogs.map(log => {
        const statusColor = log.status === 'success' ? '#4ade80' : '#f87171';
        return `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 6px; text-align:center; font-weight:bold; color:#1eb2ff;">${log.runNumber || 1}</td>
            <td style="padding: 6px; color:${statusColor}; font-weight:bold;">${log.status.toUpperCase()}</td>
            <td style="padding: 6px;">
              <div style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight:600;">${log.groupName}</div>
              ${log.error ? `<div style="color:#f87171; font-size:9px; line-height:1.1; margin-top:2px;">${log.error}</div>` : ''}
              <div style="color:#9ca3af; font-size:9px;">Post: ${log.postContent || '...'}</div>
            </td>
            <td style="padding: 6px; color: #9ca3af; font-size:10px;">${log.timestamp || ''}</td>
          </tr>
        `;
      }).join('');

      html += `</tbody></table>`;
      logEntriesContainer.innerHTML = html;
    });
  }

  if (activityLogIcon) {
    activityLogIcon.addEventListener('click', () => {
      activityLogModal?.classList.remove('hidden');
      renderActivityLogs();
    });
  }

  if (closeActivityLog) {
    closeActivityLog.addEventListener('click', () => {
      activityLogModal?.classList.add('hidden');
    });
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all activity logs?')) {
        chrome.storage.local.set({ activityLogs: [] }, () => {
          renderActivityLogs();
        });
      }
    });
  }

  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', renderActivityLogs);
  }

  // ============================================================
  // SHOW UI
  // ============================================================
  document.body.classList.remove('hidden');
});
