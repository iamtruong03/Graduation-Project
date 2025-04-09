package com.truongdev.xdevbase.repo;

import com.truongdev.xdevbase.entity.BaseEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseRepo  <E extends BaseEntity> extends JpaRepository<E, Long> {
  Optional<E> findByCompanyIdAndId(Long cid, Long id);

  List<E> findAllByCompanyIdAndStatus(Long cid, Integer status);
}
