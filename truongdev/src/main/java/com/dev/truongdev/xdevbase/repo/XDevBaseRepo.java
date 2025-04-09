package com.dev.truongdev.xdevbase.repo;

import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface XDevBaseRepo <E extends XDevBaseEntity> extends JpaRepository<E, Long> {
  Optional<E> findByCompanyIdAndId(Long cid, Long id);

  List<E> findAllByCompanyIdAndStatus(Long cid, Integer status);
}
