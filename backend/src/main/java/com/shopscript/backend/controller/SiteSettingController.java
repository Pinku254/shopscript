package com.shopscript.backend.controller;

import com.shopscript.backend.entity.SiteSetting;
import com.shopscript.backend.repository.SiteSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:3000")
public class SiteSettingController {

    @Autowired
    private SiteSettingRepository siteSettingRepository;

    @PostConstruct
    public void init() {
        if (siteSettingRepository.count() == 0) {
            saveSetting("hero_title", "Find Your Next Obsession");
            saveSetting("hero_subtitle",
                    "Shop the latest trends in fashion, electronics, and home essentials. unbeatable prices and premium quality.");
            saveSetting("hero_image",
                    "https://images.unsplash.com/photo-1472851294608-415522f97817?auto=format&fit=crop&q=80&w=1920");
        }
    }

    private void saveSetting(String key, String value) {
        SiteSetting setting = new SiteSetting();
        setting.setSettingKey(key);
        setting.setSettingValue(value);
        siteSettingRepository.save(setting);
    }

    @GetMapping
    public Map<String, String> getAllSettings() {
        return siteSettingRepository.findAll().stream()
                .collect(Collectors.toMap(SiteSetting::getSettingKey, SiteSetting::getSettingValue));
    }

    @PostMapping
    public void updateSettings(@RequestBody Map<String, String> settings) {
        settings.forEach((key, value) -> {
            SiteSetting setting = siteSettingRepository.findBySettingKey(key)
                    .orElse(new SiteSetting());
            setting.setSettingKey(key);
            setting.setSettingValue(value);
            siteSettingRepository.save(setting);
        });
    }
}
