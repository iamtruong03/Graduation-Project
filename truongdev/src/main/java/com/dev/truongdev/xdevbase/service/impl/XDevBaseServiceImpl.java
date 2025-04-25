package com.dev.truongdev.xdevbase.service.impl;

import com.dev.truongdev.utils.AppConstants;
import com.dev.truongdev.xdevbase.entity.XDevBaseEntity;
import com.dev.truongdev.xdevbase.repo.XDevBaseRepo;
import com.dev.truongdev.xdevbase.service.IXDevBaseService;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.BeanUtils;

@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
public class XDevBaseServiceImpl <
    E extends XDevBaseEntity, R extends XDevBaseRepo<E>>
    implements IXDevBaseService<E> {
  final R repo;

  public void setBaseEntity (E e, String uid){
    e.setCreateBy(Optional.ofNullable(e.getCreateBy()).orElse(uid));
    e.setUpdateBy(uid);
    e.setStatus(AppConstants.STATUS_ACTIVE);
    e.setState(AppConstants.STATUS_NEW);
  }

  @Override
  @Transactional
  public E create(String uid, E e){
    setBaseEntity(e, uid);
    return repo.save(e);
  }

  @Override
  @Transactional
  public E update(String uid, E e , Long id){
    E data = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("data_not_found"));
    BeanUtils.copyProperties(e, data, "id", "createBy", "version", "createDate", "modifiedDate");
    data.setUpdateBy(uid);
    return repo.save(data);
  }

  @Override
  public void delete(String uid, Long id) {
    repo.deleteById(id);
  }

  @Override
  public void changeStatus(String uid, Long id) {
    E entity = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Entity not found"));
    if (!Objects.equals(entity.getStatus(), AppConstants.STATUS_ACTIVE)) {
      throw new RuntimeException("delete_allow_status_new");
    }
    entity.setStatus(AppConstants.STATUS_INACTIVE);
    repo.save(entity);
  }

  @Override
  public E getById(String uid, Long id) {
    return repo.findById(id).orElseThrow(() -> new RuntimeException("Data not found"));
  }

  @Override
  public List<E> getAll(Long id, String uid) {
    return repo.findAllByStatus(AppConstants.STATUS_ACTIVE);
  }
}
