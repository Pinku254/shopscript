package com.shopscript.backend.repository;

import com.shopscript.backend.entity.SiteSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {
    Optional<SiteSetting> findBySettingKey(String settingKey);
}
